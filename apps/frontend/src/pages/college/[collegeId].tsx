import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function CollegeProfile() {
  const { query } = useRouter();
  const { data } = useSWR(
    query.collegeId ? `/college/${query.collegeId}` : null,
    fetcher
  );

  if (!data) return <p>Loading...</p>;

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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-600 font-montserrat">
      {/* Navbar */}
      <nav className="w-full bg-purple-700/80 backdrop-blur border-b border-white/20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2"><img src="/images/graduation-cap.png" alt="" className="w-8 h-8" /></div>
            <span className="text-white text-xl font-bold tracking-tight">Pingin</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-white/80 hover:text-white font-semibold text-lg">
            <span>← Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* College Header */}
        <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">{data.college.name}</h1>
          <div className="text-purple-200 text-lg">
            Major: {data.application.major} • Status: {data.application.status}
          </div>
        </div>

        {/* Pings Section */}
        <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Pings & Feedback</h2>
            <Link 
              href="/dashboard" 
              className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-4 py-2 hover:from-pink-500 hover:to-purple-600 transition"
            >
              Create New Ping
            </Link>
          </div>
          
          {data.pings.length === 0 ? (
            <div className="text-purple-200 text-center py-8">
              <p className="text-lg mb-2">No pings yet for this application</p>
              <p className="text-sm">Create your first ping to get feedback from your mentor!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pings.map((ping: any) => (
                <div key={ping.id} className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(ping.status)}`}></span>
                      <span className="text-white font-semibold">{getStatusText(ping.status)}</span>
                      {ping.status === 'answered' && (
                        <span className="text-yellow-400 text-sm">⭐</span>
                      )}
                    </div>
                    <span className="text-purple-200 text-sm">{formatTime(ping.created_at)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-white font-semibold mb-1">Question:</h3>
                    <p className="text-purple-200">{ping.question}</p>
                  </div>
                  
                  {ping.answer && (
                    <div>
                      <h3 className="text-white font-semibold mb-1">Answer:</h3>
                      <p className="text-green-300">{ping.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
