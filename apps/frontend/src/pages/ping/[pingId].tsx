import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { mutate as globalMutate } from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { FaHighlighter } from "react-icons/fa";

const fetcher = (url: string) => {
  console.log("Fetching URL:", url);
  return api.get(url)
    .then(r => {
      console.log("API response:", r.data);
      return r.data;
    })
    .catch(error => {
      console.error("API error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    });
};

interface Suggestion {
  id: number;
  type: 'grammar' | 'style' | 'content' | 'structure';
  originalText: string;
  suggestedText: string;
  comment: string;
  author: string;
  timestamp: string;
  accepted: boolean;
}

interface PingData {
  id: number;
  question: string;
  status: string;
  answer: string;
  created_at: string;
  application_id: number;
  essay_id?: number;
  application: {
    college_name: string;
    major: string;
  };
  essay?: {
    id: number;
    prompt: string;
    response: string;
  };
  suggestions?: Suggestion[];
}

export default function PingDetail() {
  const { query } = useRouter();
  
  console.log("PingDetail component rendered");
  console.log("Query parameters:", query);
  console.log("Ping ID from query:", query.pingId);
  
  const [role, setRole] = useState<"student" | "consultant" | "">("");
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'grammar' | 'style' | 'content' | 'structure'>('grammar');
  const [suggestionComment, setSuggestionComment] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [suggestedText, setSuggestedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [essayContent, setEssayContent] = useState("");
  const [highlights, setHighlights] = useState<{ id: string; text: string; start: number; end: number }[]>([]);
  const [strikethroughs, setStrikethroughs] = useState<{ id: string; text: string; start: number; end: number }[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; text: string; start: number; end: number } | null>(null);
  const essayRef = React.useRef<HTMLDivElement>(null);

  const { data: ping, mutate, error, isLoading } = useSWR<PingData>(
    query.pingId ? `/pings/${query.pingId}` : null,
    fetcher
  );

  console.log("SWR state:", { ping, error, isLoading, pingId: query.pingId });

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (_) {
        setRole("");
      }
    }
  }, []);

  useEffect(() => {
    if (ping?.essay) {
      setEssayContent(ping.essay.response);
    }
  }, [ping?.essay?.response]);

  // --- Highlight selection logic (consultant only) ---
  useEffect(() => {
    if (role !== "consultant") return;
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || !essayRef.current) return;
      if (!essayRef.current.contains(selection.anchorNode) || selection.isCollapsed) {
        setSelectionBox(null);
        return;
      }
      const text = selection.toString();
      if (!text.trim()) {
        setSelectionBox(null);
        return;
      }
      // Find start and end index relative to essay text
      const essayText = essayContent;
      const anchorOffset = selection.anchorOffset;
      const focusOffset = selection.focusOffset;
      let start = Math.min(anchorOffset, focusOffset);
      let end = Math.max(anchorOffset, focusOffset);
      // Try to get the absolute index in essay text
      // (for MVP, just use essayText.indexOf(text))
      const absStart = essayText.indexOf(text);
      const absEnd = absStart + text.length;
      if (absStart === -1) {
        setSelectionBox(null);
        return;
      }
      // Get bounding rect for floating box
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionBox({
        x: rect.right + window.scrollX,
        y: rect.top + window.scrollY - 30,
        text,
        start: absStart,
        end: absEnd,
      });
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [essayContent, role]);

  // --- Strikethrough selection logic (consultant only) ---
  useEffect(() => {
    if (role !== "consultant") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!essayRef.current) return;
      const selection = window.getSelection();
      if (!selection || !essayRef.current.contains(selection.anchorNode) || selection.isCollapsed) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const text = selection.toString();
      if (!text.trim()) return;
      // Find start and end index relative to essay text
      const essayText = essayContent;
      const absStart = essayText.indexOf(text);
      const absEnd = absStart + text.length;
      if (absStart === -1) return;
      // Prevent duplicate strikethroughs
      if (strikethroughs.some(h => h.start === absStart && h.end === absEnd)) return;
      setStrikethroughs([...strikethroughs, { id: Math.random().toString(36).slice(2), text, start: absStart, end: absEnd }]);
      window.getSelection()?.removeAllRanges();
      setSelectionBox(null);
      e.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [essayContent, role, strikethroughs, setSelectionBox]);

  // --- Highlight action ---
  const handleHighlight = () => {
    if (!selectionBox) return;
    // Prevent duplicate highlights
    if (highlights.some(h => h.start === selectionBox.start && h.end === selectionBox.end)) {
      setSelectionBox(null);
      return;
    }
    setHighlights([...highlights, { id: Math.random().toString(36).slice(2), text: selectionBox.text, start: selectionBox.start, end: selectionBox.end }]);
    setSelectionBox(null);
    window.getSelection()?.removeAllRanges();
  };

  // --- Remove highlight (resolve) ---
  const handleResolve = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  // --- Render essay with highlights and strikethroughs ---
  function renderEssayWithAll(text: string) {
    // Merge highlights and strikethroughs into a single array
    const all = [
      ...highlights.map(h => ({ ...h, type: "highlight" as const })),
      ...strikethroughs.map(h => ({ ...h, type: "strike" as const })),
    ];
    if (!all.length) return text;
    // Sort by start
    const sorted = [...all].sort((a, b) => a.start - b.start);
    let lastIdx = 0;
    const nodes: React.ReactNode[] = [];
    sorted.forEach((h, i) => {
      if (h.start > lastIdx) {
        nodes.push(text.slice(lastIdx, h.start));
      }
      if (h.type === "highlight") {
        nodes.push(
          <span key={h.id} className="bg-yellow-200 text-gray-900 rounded px-1 cursor-pointer">
            {text.slice(h.start, h.end)}
          </span>
        );
      } else if (h.type === "strike") {
        nodes.push(
          <span key={h.id} className="bg-white/30 text-white line-through rounded px-1 cursor-pointer">
            {text.slice(h.start, h.end)}
          </span>
        );
      }
      lastIdx = h.end;
    });
    if (lastIdx < text.length) {
      nodes.push(text.slice(lastIdx));
    }
    return nodes;
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Montserrat,sans-serif] flex items-center justify-center">
      <div className="text-[#1f2937] text-xl">Loading ping #{query.pingId}...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8fafc] font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Montserrat,sans-serif] flex items-center justify-center">
      <div className="text-[#1f2937] text-xl">
        Error loading ping: {error.message || 'Unknown error'}
      </div>
    </div>
  );

  if (!ping) return (
    <div className="min-h-screen bg-[#f8fafc] font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Montserrat,sans-serif] flex items-center justify-center">
      <div className="text-[#1f2937] text-xl">Ping not found</div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500';
      case 'answered': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'answered': return 'Answered';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSaveEssay = async () => {
    if (!ping.essay) return;
    try {
      await api.put(`/review/${ping.essay.id}`, { response: essayContent });
      setIsEditing(false);
      // Use the global mutate function to revalidate the ping data by key
      globalMutate(`/pings/${query.pingId}`);
    } catch (error) {
      console.error("Failed to save essay:", error);
      alert("Failed to save essay. Please try again.");
    }
  };

  const handleAddSuggestion = async () => {
    if (!suggestionComment.trim() || !originalText.trim() || !suggestedText.trim()) {
      alert("Please fill in all suggestion fields");
      return;
    }

    try {
      const suggestionData = {
        ping_id: ping.id,
        type: suggestionType,
        original_text: originalText,
        suggested_text: suggestedText,
        comment: suggestionComment,
        author_id: 1, // This would come from the current user
      };

      await api.post(`/pings/${ping.id}/suggestions`, suggestionData);
      
      // Reset form
      setSuggestionType('grammar');
      setSuggestionComment("");
      setOriginalText("");
      setSuggestedText("");
      setShowSuggestionForm(false);
      
      // Refresh data
      mutate();
    } catch (error) {
      console.error("Failed to add suggestion:", error);
      alert("Failed to add suggestion. Please try again.");
    }
  };

  const handleAcceptSuggestion = async (suggestionId: number) => {
    try {
      await api.post(`/pings/${ping.id}/suggestions/${suggestionId}/accept`);
      mutate();
    } catch (error) {
      console.error("Failed to accept suggestion:", error);
      alert("Failed to accept suggestion. Please try again.");
    }
  };

  const handleRejectSuggestion = async (suggestionId: number) => {
    try {
      await api.post(`/pings/${ping.id}/suggestions/${suggestionId}/reject`);
      mutate();
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
      alert("Failed to reject suggestion. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Montserrat,sans-serif] text-[#1f2937] leading-[1.6]">
      {/* Navigation */}
      <div className="sticky top-0 z-[100]">
        <div className="bg-gradient-to-r from-[#592e81] to-[#c004d1] backdrop-blur-[20px] border-b border-white/10">
          <div className="flex justify-between items-center px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <img src="/images/graduation-cap.png" alt="Graduation Cap" className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-white">Pingin</div>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Link href="/dashboard" className="text-inherit no-underline flex items-center gap-1 hover:text-white">
                Dashboard
              </Link>
              <span>→</span>
              <span>Pings</span>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center no-underline transition-all duration-200 hover:bg-white/20 hover:-translate-y-[1px] relative">
                <img src="/images/bell.png" alt="Notifications" className="w-5 h-5 brightness-0 invert" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full"></div>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center no-underline transition-all duration-200 hover:bg-white/20 hover:-translate-y-[1px]">
                <img src="/images/settings.png" alt="Settings" className="w-5 h-5 brightness-0 invert" />
              </a>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <img src="/images/user.png" alt="User" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-0">
        <div className="bg-gradient-to-r from-[#592e81] to-[#c004d1] p-10 text-white min-h-[calc(100vh-64px)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[28px] font-bold m-0">Essay Review: {ping.application.college_name}</h1>
            <div className="px-4 py-2 bg-[rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.3)] rounded-[20px] text-sm text-[#22c55e] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22c55e] rounded-full"></div>
              {getStatusText(ping.status)}
            </div>
          </div>

          {/* Info Card Grid */}
          <div className="bg-[rgba(139,92,246,0.15)] backdrop-blur-[10px] rounded-4xl p-6 border border-white/10 mb-8 grid grid-cols-4 gap-5">
            <div className="transition-all duration-300 hover:-translate-y-[2px]">
              <div className="text-sm mb-2 opacity-80 font-normal">Ping ID</div>
              <div className="text-base font-medium m-0 font-['Courier_New',monospace] text-[#a78bfa]">#{ping.id}</div>
            </div>
            <div className="transition-all duration-300 hover:-translate-y-[2px]">
              <div className="text-sm mb-2 opacity-80 font-normal">Created</div>
              <div className="text-base font-medium m-0">{formatTime(ping.created_at)}</div>
            </div>
            <div className="transition-all duration-300 hover:-translate-y-[2px]">
              <div className="text-sm mb-2 opacity-80 font-normal">College</div>
              <div className="text-base font-medium m-0">{ping.application.college_name}</div>
            </div>
            <div className="transition-all duration-300 hover:-translate-y-[2px]">
              <div className="text-sm mb-2 opacity-80 font-normal">Major</div>
              <div className="text-base font-medium m-0">{ping.application.major}</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8 items-start">
            {/* Essay Section */}
            <div className="flex-[2] bg-[rgba(139,92,246,0.15)] backdrop-blur-[10px] rounded-4xl p-6 border border-white/10 min-h-[600px] relative">
              <div className="mb-5">
                <h3 className="text-lg mb-2.5 text-[#fbbf24] font-bold">Essay Prompt</h3>
                <p className="opacity-90 leading-[1.6] m-0">
                  {ping.essay?.prompt || ping.question}
                </p>
              </div>
              <div
                ref={essayRef}
                className="bg-[rgba(109,40,217,0.3)] rounded-xl p-5 leading-[1.8] text-base border border-white/10 min-h-[200px]"
                style={{ position: "relative" }}
              >
                {role === "student" && isEditing ? (
                  <textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    className="w-full h-full bg-transparent text-white border-none outline-none resize-none"
                    placeholder="Write your essay here..."
                  />
                ) : (
                  <div>{renderEssayWithAll(essayContent || "No essay content yet.")}</div>
                )}
                {/* Floating action box for highlight */}
                {role === "consultant" && selectionBox && (
                  <div
                    className="absolute z-50 bg-white text-gray-900 rounded shadow-lg flex items-center gap-2 px-2 py-1 border border-gray-200"
                    style={{ left: selectionBox.x - essayRef.current!.getBoundingClientRect().left, top: selectionBox.y - essayRef.current!.getBoundingClientRect().top }}
                  >
                    <button
                      className="hover:bg-yellow-100 rounded p-1"
                      title="Highlight"
                      onClick={handleHighlight}
                    >
                      <FaHighlighter className="text-yellow-500" />
                    </button>
                  </div>
                )}
              </div>

              {role === "student" && (
                <div className="flex gap-3 mt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEssay}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                    >
                      Edit Essay
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Suggestions Sidebar */}
            <div className="flex-1 max-w-[300px]">
              {role === "consultant" && (
                <button 
                  onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                  className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white border-none py-3 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 w-full mb-4 text-sm hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(245,158,11,0.4)]"
                >
                  + Add Suggestion
                </button>
              )}

              {/* Suggestion Form */}
              {showSuggestionForm && role === "consultant" && (
                <div className="bg-[rgba(139,92,246,0.15)] backdrop-blur-[10px] rounded-xl p-4 border border-white/10 mb-4 text-sm leading-[1.5] transition-all duration-300">
                  <div className="mb-4">
                    <label className="block text-white font-semibold mb-2">Suggestion Type</label>
                    <select
                      value={suggestionType}
                      onChange={(e) => setSuggestionType(e.target.value as any)}
                      className="w-full p-3 bg-[rgba(109,40,217,0.3)] border border-white/20 rounded-lg text-white focus:outline-none"
                    >
                      <option value="grammar">Grammar</option>
                      <option value="style">Style</option>
                      <option value="content">Content</option>
                      <option value="structure">Structure</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Original Text</label>
                      <textarea
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                        placeholder="Enter the original text..."
                        className="w-full p-3 bg-[rgba(109,40,217,0.3)] border border-white/20 rounded-lg text-white focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-semibold mb-2">Suggested Text</label>
                      <textarea
                        value={suggestedText}
                        onChange={(e) => setSuggestedText(e.target.value)}
                        placeholder="Enter your suggestion..."
                        className="w-full p-3 bg-[rgba(109,40,217,0.3)] border border-white/20 rounded-lg text-white focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-semibold mb-2">Comment</label>
                      <textarea
                        value={suggestionComment}
                        onChange={(e) => setSuggestionComment(e.target.value)}
                        placeholder="Add a comment explaining your suggestion..."
                        className="w-full p-3 bg-[rgba(109,40,217,0.3)] border border-white/20 rounded-lg text-white focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddSuggestion} 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                    >
                      Add Suggestion
                    </button>
                    <button
                      onClick={() => setShowSuggestionForm(false)}
                      className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Highlighted comments sidebar */}
              {role === "consultant" && highlights.length > 0 && (
                <div className="space-y-4 mb-4">
                  {highlights.map(h => (
                    <div key={h.id} className="bg-[rgba(139,92,246,0.15)] border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-2 py-1 rounded">Highlight</span>
                        <button onClick={() => handleResolve(h.id)} className="ml-auto text-xs text-gray-300 hover:text-green-500">Mark as resolved</button>
                      </div>
                      <div className="text-yellow-100 text-sm">{h.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strikethrough suggestions */}
              {role === "consultant" && strikethroughs.length > 0 && (
                <div className="space-y-4 mb-4">
                  {strikethroughs.map(h => (
                    <div key={h.id} className="bg-[rgba(139,92,246,0.15)] border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-1 rounded line-through">Delete</span>
                      </div>
                      <div className="text-white/80 text-sm line-through mb-2">{h.text}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            // Remove the text from essayContent and remove the strikethrough
                            setEssayContent(prev => prev.slice(0, h.start) + prev.slice(h.end));
                            setStrikethroughs(strikethroughs.filter(s => s.id !== h.id));
                          }}
                          className="bg-green-600/80 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-600 transition-all duration-300 hover:scale-105"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setStrikethroughs(strikethroughs.filter(s => s.id !== h.id))}
                          className="bg-white/10 text-purple-200 px-3 py-1 rounded text-xs font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions List */}
              <div className="space-y-4">
                {ping.suggestions && ping.suggestions.length > 0 ? (
                  ping.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-[rgba(139,92,246,0.15)] backdrop-blur-[10px] rounded-xl p-4 border border-white/10 mb-4 text-sm leading-[1.5] transition-all duration-300 hover:-translate-x-[2px] hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          suggestion.type === 'grammar' ? 'bg-[rgba(139,69,19,0.3)] text-[#d2691e]' :
                          suggestion.type === 'style' ? 'bg-[rgba(34,197,94,0.3)] text-[#22c55e]' :
                          suggestion.type === 'content' ? 'bg-[rgba(245,158,11,0.3)] text-[#f59e0b]' :
                          'bg-[rgba(139,92,246,0.3)] text-[#a78bfa]'
                        }`}>
                          {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                        </span>
                        <span className="opacity-70 text-xs">{formatTime(suggestion.timestamp)}</span>
                      </div>
                      
                      <div className="opacity-90 text-sm">
                        <div className="mb-2">
                          <strong className="text-white">Original:</strong>
                          <span className="line-through text-red-300 ml-2">{suggestion.originalText}</span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-white">Suggested:</strong>
                          <span className="text-green-300 ml-2">{suggestion.suggestedText}</span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-white">Comment:</strong>
                          <span className="ml-2">{suggestion.comment}</span>
                        </div>
                      </div>

                      {role === "student" && !suggestion.accepted && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <div className="text-xs opacity-80 cursor-pointer flex gap-4">
                            <span onClick={() => handleAcceptSuggestion(suggestion.id)} className="hover:text-green-300">Apply</span>
                            <span onClick={() => handleRejectSuggestion(suggestion.id)} className="hover:text-red-300">Dismiss</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/70 py-8">
                    No suggestions yet. {role === "consultant" && "Add the first suggestion!"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 