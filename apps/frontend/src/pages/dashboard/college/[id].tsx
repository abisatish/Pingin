import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(r => r.data);

const avatarColors = [
  "bg-fuchsia-600", "bg-blue-600", "bg-green-600", "bg-yellow-500", "bg-pink-500", "bg-purple-600"
];

export default function CollegeDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error } = useSWR(id ? `/college/${id}/dashboard` : null, fetcher);

  if (error) return <div className="text-red-500">Error loading college dashboard</div>;
  if (!data) return <div className="text-white">Loading...</div>;

  const { college, progress, current_essay, recent_feedback, documents } = data;

  // Helper for avatar color
  function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  return (
    <div className="min-h-screen bg-[#101014] text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
      {/* Navigation */}
      <div className="bg-gradient-to-r from-[#6d28d9] via-[#a21caf] to-[#f472b6] border-b border-[#232336] shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-2">
              <img src="/images/graduation-cap.svg" alt="Logo" className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Pingin</h1>
          </div>
          <div className="flex items-center space-x-2 text-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:text-white text-sm">
              <span>Dashboard</span>
              <img src="/images/arrow-right.svg" alt="" className="w-4 h-4" />
              <span className="font-semibold text-white">{college.name}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative hover:bg-[#232336] p-2 rounded-full">
              <img src="/images/bell.svg" alt="Notifications" className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
            </button>
            <button className="hover:bg-[#232336] p-2 rounded-full">
              <img src="/images/settings.svg" alt="Settings" className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* College Header */}
      <div className="bg-gradient-to-r from-[#6d28d9] via-[#a21caf] to-[#f472b6] border-b border-[#232336] py-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="bg-[#18181b] rounded-2xl p-4 border-2 border-[#232336] shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl font-extrabold">
                {college.name.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1 tracking-tight">{college.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm items-center">
                <span className="text-pink-400 font-bold">{college.category} School</span>
                <span className="text-gray-200">Deadline: <span className="font-semibold">{college.deadline}</span></span>
                <span className="text-gray-200">Acceptance Rate: <span className="font-semibold">{college.acceptance_rate}</span></span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-2 md:mt-0">
            <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2 rounded-xl shadow transition">Submit Application</button>
            <button className="bg-[#232336] hover:bg-[#2d2d3a] text-white font-semibold px-5 py-2 rounded-xl border border-[#39395a] transition">View Requirements</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#18181b] rounded-xl shadow-lg p-6 border border-[#232336]">
            <div className="text-gray-300 text-sm mb-2 font-semibold">Essays</div>
            <div className="text-2xl font-extrabold mb-1">{progress.essays.completed}/{progress.essays.total} <span className="font-bold text-base">Complete</span></div>
            <div className="bg-[#232336] rounded h-2 w-full">
              <div className="bg-fuchsia-500 h-2 rounded" style={{ width: `${progress.essays.percentage}%` }}></div>
            </div>
          </div>
          <div className="bg-[#18181b] rounded-xl shadow-lg p-6 border border-[#232336]">
            <div className="text-gray-300 text-sm mb-2 font-semibold">Documents</div>
            <div className="text-2xl font-extrabold mb-1">{progress.documents.submitted}/{progress.documents.total} <span className="font-bold text-base">Submitted</span></div>
            <div className="bg-[#232336] rounded h-2 w-full">
              <div className="bg-green-400 h-2 rounded" style={{ width: `${progress.documents.percentage}%` }}></div>
            </div>
          </div>
          <div className="bg-[#18181b] rounded-xl shadow-lg p-6 border border-[#232336]">
            <div className="text-gray-300 text-sm mb-2 font-semibold">Recommendations</div>
            <div className="text-2xl font-extrabold mb-1">{progress.recommendations.received}/{progress.recommendations.total} <span className="font-bold text-base">Received</span></div>
            <div className="bg-[#232336] rounded h-2 w-full">
              <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress.recommendations.percentage}%` }}></div>
            </div>
          </div>
          <div className="bg-[#18181b] rounded-xl shadow-lg p-6 border border-[#232336]">
            <div className="text-gray-300 text-sm mb-2 font-semibold">Application Status</div>
            <div className="text-2xl font-extrabold mb-1 text-yellow-400">{progress.application_status}</div>
            <div className="bg-[#232336] rounded h-2 w-full">
              <div className="bg-yellow-400 h-2 rounded" style={{ width: "45%" }}></div>
            </div>
          </div>
        </div>

        {/* Current Essay Section */}
        <div className="bg-[#18181b] rounded-2xl shadow-xl border border-[#232336] p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold mb-1">Current Essay: {current_essay.title}</h2>
              <div className="text-gray-400 text-sm">Last updated: {current_essay.last_updated ? new Date(current_essay.last_updated).toLocaleString() : 'Never'}</div>
            </div>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-2 rounded-xl shadow transition">Edit Essay</button>
          </div>

          {/* Essay Prompt */}
          <div className="bg-[#232336] rounded-xl p-5 mb-6">
            <div className="text-fuchsia-400 font-bold mb-2">Essay Prompt</div>
            <div className="text-gray-100 text-base leading-relaxed">{current_essay.prompt}</div>
          </div>

          {/* Essay Preview */}
          <div className="bg-[#232336] rounded-xl p-6 mb-6">
            <div className="text-fuchsia-400 mb-2 font-bold">Essay Draft ({current_essay.word_count}/{current_essay.max_words} words)</div>
            <div className="text-gray-100 text-base leading-relaxed whitespace-pre-line">
              {current_essay.response || "No essay content yet. Click 'Edit Essay' to get started."}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold">Recent Feedback & Suggestions</h3>
              <Link href="#" className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold">View All (12)</Link>
            </div>
            <div className="space-y-4">
              {recent_feedback.map((feedback: any, idx: number) => (
                <div key={feedback.id} className="bg-[#232336] rounded-xl p-5 flex flex-col md:flex-row md:items-start gap-4 shadow border border-[#39395a]">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-lg font-bold text-white shadow ${getAvatarColor(feedback.author)}`}>{feedback.author.split(' ').map((n: string) => n[0]).join('').slice(0,2)}</div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                      <div>
                        <span className="font-bold text-white">{feedback.author}</span>
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-fuchsia-700/30 text-fuchsia-300 font-semibold">{feedback.author_role}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 md:mt-0">{new Date(feedback.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-gray-100 mb-3 text-base leading-relaxed">{feedback.content}</div>
                    <div className="flex gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition">Mark as Addressed</button>
                      <button className="bg-[#39395a] hover:bg-fuchsia-700 text-fuchsia-200 text-xs font-bold px-3 py-1 rounded-lg transition">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Library */}
          <div className="bg-[#232336] rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">All {college.name} Documents</h3>
              <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2 rounded-xl shadow transition">Upload New</button>
            </div>
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between bg-[#18181b] rounded-lg p-4 border border-[#39395a] shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src="/images/document.svg" alt="" className="w-6 h-6 opacity-80" />
                    <div>
                      <div className="text-white font-semibold">{doc.name}</div>
                      <div className="text-gray-400 text-xs">{doc.updated_at}</div>
                    </div>
                  </div>
                  <button className="bg-[#39395a] hover:bg-fuchsia-700 text-fuchsia-200 text-xs font-bold px-4 py-1 rounded-lg transition">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 