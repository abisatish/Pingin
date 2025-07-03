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
  const [additions, setAdditions] = useState<{ id: string; text: string; start: number; end: number }[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; text: string; start: number; end: number } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStart, setTypingStart] = useState<number | null>(null);
  const [typingText, setTypingText] = useState("");
  const [highlightComments, setHighlightComments] = useState<{ [key: string]: string }>({});
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

  useEffect(() => {
    if (!query.pingId) return;
    async function fetchComments() {
      try {
        const res = await api.get(`/pings/${query.pingId}/comments`);
        const comments = res.data.filter((c: any) => !c.resolved);
        console.log("Fetched comments:", comments);
        setHighlights(
          comments.map((c: any) => ({
            id: String(c.id),
            text: essayContent.slice(c.anchor_start, c.anchor_end),
            start: c.anchor_start,
            end: c.anchor_end
          }))
        );
        setHighlightComments(
          Object.fromEntries(comments.map((c: any) => [String(c.id), c.body]))
        );
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    }
    fetchComments();
  }, [query.pingId, essayContent]);

  // Fetch strikethroughs on page load
  useEffect(() => {
    if (!query.pingId) return;
    async function fetchStrikethroughs() {
      try {
        const res = await api.get(`/pings/${query.pingId}/strikethroughs`);
        const sts = res.data;
        setStrikethroughs(
          sts.map((s: any) => ({
            id: String(s.id),
            text: s.text,
            start: s.anchor_start,
            end: s.anchor_end
          }))
        );
      } catch (err) {
        console.error("Failed to fetch strikethroughs:", err);
      }
    }
    fetchStrikethroughs();
  }, [query.pingId]);

  // Fetch additions on page load
  useEffect(() => {
    if (!query.pingId) return;
    async function fetchAdditions() {
      try {
        const res = await api.get(`/pings/${query.pingId}/additions`);
        const adds = res.data;
        setAdditions(
          adds.map((a: any) => ({
            id: String(a.id),
            text: a.text,
            start: a.anchor_start,
            end: a.anchor_start + a.text.length
          }))
        );
      } catch (err) {
        console.error("Failed to fetch additions:", err);
      }
    }
    fetchAdditions();
  }, [query.pingId]);

  // Create a new strikethrough
  const handleCreateStrikethrough = async (start: number, end: number, text: string) => {
    try {
      const res = await api.post(`/pings/${query.pingId}/strikethroughs`, {
        anchor_start: start,
        anchor_end: end,
        text
      });
      const s = res.data;
      setStrikethroughs(prev => [
        ...prev,
        { id: String(s.id), text: s.text, start: s.anchor_start, end: s.anchor_end }
      ]);
    } catch (err) {
      console.error("Failed to create strikethrough:", err);
    }
  };

  // --- Highlight selection logic (consultant only) ---
  useEffect(() => {
    if (role !== "consultant") return;
    const handleMouseUp = (e: MouseEvent) => {
      // Small delay to ensure selection is complete
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || !essayRef.current) return;
        
        // Check if the selection is within our essay container
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !essayRef.current.contains(range.commonAncestorContainer)) {
          setSelectionBox(null);
          return;
        }
        
        if (selection.isCollapsed) {
          setSelectionBox(null);
          return;
        }
        
        const selectedText = selection.toString();
        if (!selectedText.trim()) {
          setSelectionBox(null);
          return;
        }
        
        // Try simple search first
        let startPos = essayContent.indexOf(selectedText);
        let endPos = startPos + selectedText.length;
        
        // If simple search fails, we need to calculate position accounting for additions
        if (startPos === -1) {
          console.log("Simple search failed, using complex position calculation");
          
          // Build a map of visual position to original text position
          const positionMap: { visualPos: number; originalPos: number }[] = [];
          let visualPos = 0;
          let originalPos = 0;
          
          // First, map out the original text positions
          for (let i = 0; i < essayContent.length; i++) {
            positionMap.push({ visualPos, originalPos: i });
            visualPos++;
            originalPos = i + 1;
          }
          
          // Now adjust for additions (they add visual positions but not original positions)
          const sortedAdditions = [...additions].sort((a, b) => a.start - b.start);
          for (const addition of sortedAdditions) {
            // Find where this addition appears in our position map
            const insertIndex = positionMap.findIndex(p => p.originalPos > addition.start);
            if (insertIndex !== -1) {
              // Shift all visual positions after this addition
              for (let i = insertIndex; i < positionMap.length; i++) {
                positionMap[i].visualPos += addition.text.length;
              }
            }
          }
          
          // Now find where our selection starts and ends in the visual space
          const walker = document.createTreeWalker(
            essayRef.current,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          let currentVisualPos = 0;
          let foundStart = false;
          let visualStartPos = -1;
          let visualEndPos = -1;
          
          while (node = walker.nextNode()) {
            const nodeText = node.textContent || '';
            
            if (!foundStart && range.startContainer === node) {
              visualStartPos = currentVisualPos + range.startOffset;
              foundStart = true;
            }
            
            if (range.endContainer === node) {
              visualEndPos = currentVisualPos + range.endOffset;
              break;
            }
            
            currentVisualPos += nodeText.length;
          }
          
          // Convert visual positions back to original text positions
          if (visualStartPos !== -1 && visualEndPos !== -1) {
            // Find the closest original position for start
            const startMapping = positionMap.reduce((prev, curr) => 
              Math.abs(curr.visualPos - visualStartPos) < Math.abs(prev.visualPos - visualStartPos) ? curr : prev
            );
            
            const endMapping = positionMap.reduce((prev, curr) => 
              Math.abs(curr.visualPos - visualEndPos) < Math.abs(prev.visualPos - visualEndPos) ? curr : prev
            );
            
            startPos = startMapping.originalPos;
            endPos = endMapping.originalPos;
            
            // Verify the text matches
            const extractedText = essayContent.slice(startPos, endPos);
            if (extractedText !== selectedText) {
              // Try to find the exact text near our calculated position
              const searchStart = Math.max(0, startPos - 10);
              const searchEnd = Math.min(essayContent.length, endPos + 10);
              const searchArea = essayContent.slice(searchStart, searchEnd);
              const foundIndex = searchArea.indexOf(selectedText);
              
              if (foundIndex !== -1) {
                startPos = searchStart + foundIndex;
                endPos = startPos + selectedText.length;
              }
            }
          }
        }
        
        if (startPos === -1 || endPos === -1) {
          console.error("Could not find selected text position", { selectedText, startPos, endPos });
          setSelectionBox(null);
          return;
        }
        
        // Get bounding rect for floating box
        const rect = range.getBoundingClientRect();
        const containerRect = essayRef.current.getBoundingClientRect();
        
        setSelectionBox({
          x: rect.right - containerRect.left + 10,
          y: rect.top - containerRect.top - 30,
          text: selectedText,
          start: startPos,
          end: endPos,
        });
      }, 10);
    };
    
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [essayContent, role, additions]);

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
      
      // Call the API to create the strikethrough in the database
      handleCreateStrikethrough(absStart, absEnd, text);
      
      window.getSelection()?.removeAllRanges();
      setSelectionBox(null);
      e.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [essayContent, role, strikethroughs, setSelectionBox, handleCreateStrikethrough]);

  // --- Cursor placement and typing logic (consultant only) ---
  useEffect(() => {
    if (role !== "consultant") return;
    
    const handleDoubleClick = (e: MouseEvent) => {
      if (!essayRef.current || !essayRef.current.contains(e.target as Node)) return;
      if (isTyping) return;
      
      // Clear any existing selection
      window.getSelection()?.removeAllRanges();
      setSelectionBox(null);
      
      let clickOffset = 0;
      
      // Get the exact position using caretRangeFromPoint
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range && essayRef.current.contains(range.startContainer)) {
        const container = range.startContainer;
        const offset = range.startOffset;
        
        // Helper function to get text content up to a certain node
        const getOffsetInOriginalText = (): number => {
          let textSoFar = '';
          let countOffset = 0;
          
          // Get all text nodes in order
          const walker = document.createTreeWalker(
            essayRef.current!,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          let found = false;
          
          while (node = walker.nextNode()) {
            if (node === container) {
              // Found our target node
              countOffset += offset;
              found = true;
              break;
            } else {
              // Add the full text of this node
              const nodeText = node.textContent || '';
              
              // Check if this text exists in our original essay at the current position
              const remainingEssay = essayContent.substring(countOffset);
              const indexInRemaining = remainingEssay.indexOf(nodeText);
              
              if (indexInRemaining === 0) {
                // This text is at the current position in the original
                countOffset += nodeText.length;
              } else if (indexInRemaining > 0) {
                // This text appears later, so we need to account for a gap
                countOffset += indexInRemaining + nodeText.length;
              } else {
                // This is likely inserted text (addition/typing), skip it
                continue;
              }
            }
          }
          
          if (!found) {
            // Clicked on something weird, just use the end
            countOffset = essayContent.length;
          }
          
          return Math.min(Math.max(0, countOffset), essayContent.length);
        };
        
        clickOffset = getOffsetInOriginalText();
      } else {
        // Fallback to start of text
        clickOffset = 0;
      }
      
      // Start typing mode
      setIsTyping(true);
      setTypingStart(clickOffset);
      setTypingText("");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTyping || typingStart === null) return;
      
      if (e.key === "Escape") {
        setIsTyping(false);
        setTypingStart(null);
        setTypingText("");
        return;
      }
      
      if (e.key === "Enter") {
        if (typingText.trim()) {
          // Create the addition
          handleCreateAddition(typingStart, typingText);
        }
        setIsTyping(false);
        setTypingStart(null);
        setTypingText("");
        return;
      }
      
      if (e.key === "Backspace") {
        setTypingText(prev => prev.slice(0, -1));
        e.preventDefault();
        return;
      }
      
      // Only add printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setTypingText(prev => prev + e.key);
        e.preventDefault(); // Prevent default to avoid affecting the document
      }
    };
    
    document.addEventListener("dblclick", handleDoubleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [role, isTyping, typingStart, typingText, essayContent]);

  // --- Highlight action ---
  const handleHighlight = async () => {
    if (!selectionBox) return;
    
    // Prevent duplicate highlights
    if (highlights.some(h => h.start === selectionBox.start && h.end === selectionBox.end)) {
      setSelectionBox(null);
      window.getSelection()?.removeAllRanges();
      return;
    }
    
    // Save the selection data before clearing
    const selectionData = {
      text: selectionBox.text,
      start: selectionBox.start,
      end: selectionBox.end
    };
    
    // Clear selection box and browser selection immediately
    setSelectionBox(null);
    window.getSelection()?.removeAllRanges();
    
    try {
      // Save to backend first with empty comment
      const res = await api.post(`/pings/${query.pingId}/comments`, {
        anchor_start: selectionData.start,
        anchor_end: selectionData.end,
        body: "" // Empty comment initially
      });
      
      const backendId = String(res.data.id);
      
      // Add the highlight with the backend ID
      const newHighlight = { 
        id: backendId, 
        text: selectionData.text, 
        start: selectionData.start, 
        end: selectionData.end 
      };
      
      setHighlights(prev => [...prev, newHighlight]);
      
      // Initialize empty comment for this highlight
      setHighlightComments(prev => ({
        ...prev,
        [backendId]: ""
      }));
      
    } catch (err) {
      console.error("Failed to save highlight:", err);
      alert("Failed to create highlight. Please try again.");
    }
  };

  // --- Remove highlight (resolve) ---
  const handleResolve = async (id: string) => {
    try {
      await api.post(`/pings/${query.pingId}/comments/${id}/resolve`);
    } catch (err) {
      console.error("Failed to resolve comment:", err);
    }
    setHighlights(highlights.filter(h => h.id !== id));
    // Also remove the comment
    const newComments = { ...highlightComments };
    delete newComments[id];
    setHighlightComments(newComments);
  };

  // --- Save highlight comment ---
  const handleSaveHighlightComment = async (id: string, comment: string) => {
    // Update local state immediately
    setHighlightComments(prev => ({
      ...prev,
      [id]: comment
    }));
    
    // Only send PATCH request if it's an existing highlight (numeric ID)
    if (!isNaN(Number(id))) {
      try {
        await api.patch(`/pings/${query.pingId}/comments/${id}`, { body: comment });
      } catch (err) {
        console.error("Failed to update comment in backend:", err);
      }
    }
  };

  // --- Render essay with highlights and strikethroughs ---
  function renderEssayWithAll(text: string) {
    // Prepare all overlays (highlights, strikethroughs, additions)
    type OverlayType = { 
      id: string; 
      text: string; 
      start: number; 
      end: number; 
      type: 'highlight' | 'strike' | 'addition' | 'typing' 
    };
    
    let overlays: OverlayType[] = [
      ...highlights.map(h => ({ ...h, type: "highlight" as const })),
      ...strikethroughs.map(h => ({ ...h, type: "strike" as const })),
      ...additions.map(a => ({ ...a, type: "addition" as const })),
    ];

    // Add typing as a live overlay if active
    if (isTyping && typingStart !== null) {
      overlays.push({ 
        id: "__typing__", 
        text: typingText, 
        start: typingStart, 
        end: typingStart, 
        type: "typing" 
      });
    }

    // Sort overlays by start position
    const sortedOverlays = overlays.sort((a, b) => a.start - b.start);

    if (sortedOverlays.length === 0) {
      return [text];
    }

    let nodes: React.ReactNode[] = [];
    let currentIndex = 0;
    
    for (let i = 0; i < sortedOverlays.length; i++) {
      const overlay = sortedOverlays[i];
      
      // Add any text before this overlay
      if (overlay.start > currentIndex) {
        nodes.push(text.slice(currentIndex, overlay.start));
      }
      
      // Handle different overlay types
      if (overlay.type === "typing") {
        // For typing, insert at the position without consuming text
        nodes.push(
          <span key={overlay.id} className="relative inline-block">
            <span className="bg-blue-500 text-white px-1 rounded font-medium">
              {overlay.text}
              <span className="inline-block w-0.5 h-4 bg-white ml-0.5 animate-pulse"></span>
            </span>
          </span>
        );
        // Don't update currentIndex since typing doesn't consume text
        currentIndex = overlay.start;
      } else if (overlay.type === "addition") {
        // For additions, insert at the position without consuming text
        nodes.push(
          <span key={overlay.id} className="bg-blue-200 text-blue-900 rounded px-1 cursor-pointer font-medium">
            {overlay.text}
          </span>
        );
        // Don't update currentIndex since additions don't consume text
        currentIndex = overlay.start;
      } else if (overlay.type === "highlight") {
        // Highlights consume text
        nodes.push(
          <span key={overlay.id} className="bg-yellow-200 text-gray-900 rounded px-1 cursor-pointer">
            {text.slice(overlay.start, overlay.end)}
          </span>
        );
        currentIndex = overlay.end;
      } else if (overlay.type === "strike") {
        // Strikethroughs consume text
        nodes.push(
          <span key={overlay.id} className="bg-white/30 text-white line-through rounded px-1 cursor-pointer">
            {text.slice(overlay.start, overlay.end)}
          </span>
        );
        currentIndex = overlay.end;
      }
    }
    
    // Add any remaining text
    if (currentIndex < text.length) {
      nodes.push(text.slice(currentIndex));
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

  // Accept a strikethrough
  const handleAcceptStrikethrough = async (id: string) => {
    try {
      await api.post(`/pings/${query.pingId}/strikethroughs/${id}/accept`);
      // Re-fetch essay and strikethroughs
      mutate(); // re-fetch ping/essay
      const res = await api.get(`/pings/${query.pingId}/strikethroughs`);
      const sts = res.data;
      setStrikethroughs(
        sts.map((s: any) => ({
          id: String(s.id),
          text: s.text,
          start: s.anchor_start,
          end: s.anchor_end
        }))
      );
    } catch (err) {
      console.error("Failed to accept strikethrough:", err);
    }
  };

  // Reject a strikethrough
  const handleRejectStrikethrough = async (id: string) => {
    try {
      await api.post(`/pings/${query.pingId}/strikethroughs/${id}/reject`);
      // Re-fetch strikethroughs
      const res = await api.get(`/pings/${query.pingId}/strikethroughs`);
      const sts = res.data;
      setStrikethroughs(
        sts.map((s: any) => ({
          id: String(s.id),
          text: s.text,
          start: s.anchor_start,
          end: s.anchor_end
        }))
      );
    } catch (err) {
      console.error("Failed to reject strikethrough:", err);
    }
  };

  // Create a new addition
  const handleCreateAddition = async (start: number, text: string) => {
    try {
      const res = await api.post(`/pings/${query.pingId}/additions`, {
        anchor_start: start,
        text
      });
      const a = res.data;
      
      // Add the new addition to the state
      setAdditions(prev => [
        ...prev,
        { 
          id: String(a.id), 
          text: a.text, 
          start: a.anchor_start, 
          end: a.anchor_start // For additions, end = start since they're insertions
        }
      ]);
    } catch (err) {
      console.error("Failed to create addition:", err);
    }
  };

  // Accept an addition
  const handleAcceptAddition = async (id: string) => {
    try {
      await api.post(`/pings/${query.pingId}/additions/${id}/accept`);
      // Re-fetch essay and additions
      mutate(); // re-fetch ping/essay
      const res = await api.get(`/pings/${query.pingId}/additions`);
      const adds = res.data;
      setAdditions(
        adds.map((a: any) => ({
          id: String(a.id),
          text: a.text,
          start: a.anchor_start,
          end: a.anchor_start + a.text.length
        }))
      );
    } catch (err) {
      console.error("Failed to accept addition:", err);
    }
  };

  // Reject an addition
  const handleRejectAddition = async (id: string) => {
    try {
      await api.post(`/pings/${query.pingId}/additions/${id}/reject`);
      // Re-fetch additions
      const res = await api.get(`/pings/${query.pingId}/additions`);
      const adds = res.data;
      setAdditions(
        adds.map((a: any) => ({
          id: String(a.id),
          text: a.text,
          start: a.anchor_start,
          end: a.anchor_start + a.text.length
        }))
      );
    } catch (err) {
      console.error("Failed to reject addition:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Montserrat,sans-serif] text-[#1f2937] leading-[1.6]">
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
      
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
                style={{ position: "relative", userSelect: role === "consultant" ? "text" : "none" }}
              >
                {role === "student" && isEditing ? (
                  <textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    className="w-full h-full bg-transparent text-white border-none outline-none resize-none"
                    placeholder="Write your essay here..."
                  />
                ) : (
                  <div>
                    {renderEssayWithAll(essayContent || "No essay content yet.")}
                  </div>
                )}
                {/* Floating action box for highlight */}
                {role === "consultant" && selectionBox && (
                  <div
                    className="absolute z-50 bg-white text-gray-900 rounded shadow-lg flex items-center gap-2 px-2 py-1 border border-gray-200"
                    style={{ left: selectionBox.x, top: selectionBox.y }}
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
                
                {/* Typing mode indicator */}
                {role === "consultant" && isTyping && (
                  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse shadow-lg">
                    Typing Mode - Press Enter to finish, Esc to cancel
                  </div>
                )}
                
                {/* Instructions for typing mode */}
                {role === "consultant" && !isTyping && (
                  <div className="absolute bottom-2 left-2 bg-white/10 text-white/70 px-3 py-1 rounded-lg text-xs">
                    Double-click anywhere to add text
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
              {/* Comments & Suggestions Header */}
              <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white border-none py-3 px-4 rounded-lg font-medium text-center mb-4 text-sm">
                Comments & Suggestions
              </div>

              {/* Highlighted comments sidebar */}
              {highlights.length > 0 && (
                <div className="space-y-4 mb-4">
                  {highlights.map(h => (
                    <div key={h.id} className="bg-[rgba(139,92,246,0.15)] border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-2 py-1 rounded">Comment</span>
                        {role === "consultant" && (
                          <button onClick={() => handleResolve(h.id)} className="ml-auto text-xs text-gray-300 hover:text-green-500">Mark as resolved</button>
                        )}
                      </div>
                      <div className="text-yellow-100 text-sm mb-3">{h.text}</div>
                      {role === "consultant" && (
                        <div className="space-y-2">
                          <label className="block text-white/80 text-xs font-medium">Add comment:</label>
                          <textarea
                            value={highlightComments[h.id] || ""}
                            onChange={(e) => handleSaveHighlightComment(h.id, e.target.value, false)}
                            placeholder="Type your comment here..."
                            className="w-full p-2 bg-[rgba(109,40,217,0.3)] border border-white/20 rounded-lg text-white text-sm focus:outline-none resize-none"
                            rows={2}
                            onBlur={(e) => handleSaveHighlightComment(h.id, e.target.value, true)}
                          />
                        </div>
                      )}
                      {role === "student" && highlightComments[h.id] && (
                        <div className="text-white/80 text-sm">
                          <strong>Comment:</strong> {highlightComments[h.id]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Strikethrough suggestions */}
              {strikethroughs.length > 0 && (
                <div className="space-y-4 mb-4">
                  {strikethroughs.map(h => (
                    <div key={h.id} className="bg-[rgba(139,92,246,0.15)] border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-1 rounded">Delete</span>
                      </div>
                      <div className="text-white/80 text-sm line-through mb-2">{h.text}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAcceptStrikethrough(h.id)}
                          disabled={role === "consultant"}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-300 hover:scale-105 ${
                            role === "consultant" 
                              ? "bg-green-600/30 text-green-300 cursor-not-allowed" 
                              : "bg-green-600/80 text-white hover:bg-green-600"
                          }`}
                          title={role === "consultant" ? "Only students can accept strikethroughs" : "Accept this strikethrough"}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectStrikethrough(h.id)}
                          className="bg-white/10 text-purple-200 px-3 py-1 rounded text-xs font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          title="Remove this strikethrough"
                        >
                          <span>🗑️</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Additions (typed text, backend-connected) */}
              {additions && additions.length > 0 && (
                <div className="space-y-4 mb-4">
                  {additions.map(h => (
                    <div key={h.id} className="bg-[rgba(139,92,246,0.15)] border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-200 text-blue-900 text-xs font-bold px-2 py-1 rounded">Addition</span>
                        {role === "consultant" && (
                          <button onClick={() => handleRejectAddition(h.id)} className="ml-auto text-xs text-gray-300 hover:text-red-500">Remove</button>
                        )}
                      </div>
                      <div className="text-blue-100 text-sm">{h.text}</div>
                      {role === "student" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAcceptAddition(h.id)}
                            className="bg-blue-600/80 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-600 transition-all duration-300 hover:scale-105"
                            title="Accept this addition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectAddition(h.id)}
                            className="bg-white/10 text-purple-200 px-3 py-1 rounded text-xs font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
                            title="Reject this addition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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