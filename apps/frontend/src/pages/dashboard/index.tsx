import React from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function Dashboard() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const { data } = useSWR("/dashboard", fetcher);

  useEffect(() => {
    // Check for success message from quiz completion
    const message = router.query.message as string;
    if (message) {
      setSuccessMessage(message);
      // Clear the query parameter
      router.replace("/dashboard", undefined, { shallow: true });
    }
  }, [router.query.message]);

  if (!data) return <p>Loading...</p>;

  if (data.role === "student") {
    // Example dynamic values (replace with real data as needed)
    const studentName = data.name || "Student";
    const applicationsCount = data.applications?.length || 0;
    const essaysComplete = data.essays_complete || "0/0";
    const pingsRemaining = data.pings_remaining || 0;
    const tasks = data.tasks || [
      { title: "Complete Common App Essay Draft", due: "Tomorrow", icon: "/images/circle-alert.png" },
      { title: "Schedule MIT Interview", due: "July 2", icon: "/images/circle-alert-1.png" },
      { title: "Submit Stanford Supplemental Essays", due: "July 5", icon: "/images/circle-alert.png" },
      { title: "Request Letter of Recommendation from Math Teacher", due: "July 8", icon: "/images/check.png" },
    ];
    const colleges = data.colleges || [
      { name: "Stanford University", acceptance: "15%", deadline: "Jan 5", type: "REACH" },
      { name: "UC Berkeley", acceptance: "65%", deadline: "Nov 30", type: "TARGET" },
      { name: "UCLA", acceptance: "70%", deadline: "Nov 30", type: "TARGET" },
      { name: "University of Washington", acceptance: "90%", deadline: "Dec 15", type: "SAFETY" },
    ];
    const subjects = data.subjects || ["Mathematics", "Biology", "Anthropology", "Computer Science", "Physics", "Environmental Science"];
    const activity = data.activity || [
      { title: "Essay feedback received", by: "Dr. Sarah Chen", time: "2 hours ago" },
      { title: "College list updated", by: "You", time: "1 day ago" },
      { title: "Interview prep session scheduled", by: "Prof. Michael Rodriguez", time: "2 days ago" },
    ];
    const nextSession = data.nextSession || { title: "Essay Review with Dr. Sarah Chen", time: "Tomorrow at 3:00 PM" };

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
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="relative hover:bg-purple-800/60 p-2 rounded-full"><img src="/images/bell.png" alt="Notifications" className="w-6 h-6" /><span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span></button>
              <button className="hover:bg-purple-800/60 p-2 rounded-full"><img src="/images/settings.png" alt="Settings" className="w-6 h-6" /></button>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full flex items-center justify-center"><img src="/images/user.png" alt="User" className="w-6 h-6" /></div>
            </div>
        </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
          {/* Welcome + Stats */}
      <section>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Welcome Back, {studentName}!</h1>
            <p className="text-lg text-purple-200 mb-8">Continue your journey to your dream college with guidance from expert mentors and access to our AI</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-purple-200 font-semibold mb-1">Applications</div>
                  <div className="text-3xl font-bold text-white">{applicationsCount}</div>
                </div>
                <img src="/images/file-text.png" alt="" className="w-10 h-10 opacity-80" />
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-purple-200 font-semibold mb-1">Essays Complete</div>
                  <div className="text-3xl font-bold text-white">{essaysComplete}</div>
                </div>
                <img src="/images/book-open-1.png" alt="" className="w-10 h-10 opacity-80" />
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-purple-200 font-semibold mb-1">Pings Remaining</div>
                  <div className="text-3xl font-bold text-white">{pingsRemaining}</div>
                </div>
                <img src="/images/message-circle-1.png" alt="" className="w-10 h-10 opacity-80" />
              </div>
            </div>
      </section>

          {/* Main Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Create Pings */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/images/unnamed-2.png" alt="" className="w-8 h-8" />
                  <h2 className="text-xl font-bold text-white">Create Pings</h2>
                </div>
                {/* Example ping list and dropdowns (replace with dynamic if available) */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center gap-4">
                    <div>
                      <div className="text-purple-200 font-semibold">Ping notes</div>
                      <div className="text-white">TEXT WTVR</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative w-1/2">
                      <button className="w-full rounded-lg bg-white/10 border border-white/10 p-4 flex items-center justify-between text-white font-semibold">College Dropdown <span className="ml-2">▼</span></button>
                      {/* Dropdown menu here if needed */}
                    </div>
                    <div className="relative w-1/2">
                      <button className="w-full rounded-lg bg-white/10 border border-white/10 p-4 flex items-center justify-between text-white font-semibold">Choose Your Essay <span className="ml-2">▼</span></button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center gap-4">
                    <img src="/images/1699281015444-removebg-preview.png" alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-purple-200 font-semibold">Mentor Viraj Nain</div>
                      <div className="text-white">Due: July 8</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src="/images/clock.png" alt="" className="w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">Upcoming Tasks</h2>
                  </div>
                  <a href="#" className="text-purple-200 hover:text-white font-semibold">View All</a>
                </div>
                <div className="flex flex-col gap-3">
                  {tasks.map((task: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition">
                      <div className="flex items-center gap-4">
                        <img src={task.icon} alt="" className="w-6 h-6" />
                        <div>
                          <div className="text-white font-semibold">{task.title}</div>
                          <div className="text-purple-200 text-sm">Due: {task.due}</div>
                        </div>
                      </div>
                      <span className="text-2xl text-purple-300">&gt;</span>
                    </div>
                  ))}
                </div>
                {/* Create a New Task Form (static for now) */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-2">Create a New Task</h3>
                  <form className="flex flex-col md:flex-row gap-2">
                    <input type="text" placeholder="Task Description" className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white placeholder-purple-200" />
                    <input type="text" placeholder="Enter Task Date as MM/DD/YYYY" className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white placeholder-purple-200" />
                    <button type="submit" className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-3 hover:from-pink-500 hover:to-purple-600 transition">Add Task</button>
                  </form>
                </div>
              </div>

              {/* College List */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src="/images/graduation-cap.png" alt="" className="w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">Your College List</h2>
                  </div>
                  <a href="#" className="text-purple-200 hover:text-white font-semibold">Edit List</a>
                </div>
                <div className="flex flex-col gap-3">
                  {colleges.map((college: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{college.name}</div>
                        <div className="text-purple-200 text-sm">Acceptance Rate: {college.acceptance}  Deadline: {college.deadline}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${college.type === 'REACH' ? 'bg-pink-500 text-white' : college.type === 'TARGET' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>{college.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar (1/3) */}
            <aside className="flex flex-col gap-8">
              {/* Subjects */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Subjects I'm Passionate About</h2>
                <div className="flex flex-col gap-2">
                  {subjects.map((subject: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-white/5 border border-white/10 p-3 text-white font-semibold">{subject}</div>
                  ))}
                </div>
              </div>
              {/* Recent Activity */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="flex flex-col gap-3">
                  {activity.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-pink-400"></span>
                      <div>
                        <div className="text-white font-semibold">{item.title}</div>
                        <div className="text-purple-200 text-sm">by {item.by}</div>
                        <div className="text-purple-300 text-xs">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Next Session */}
              <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Next Session</h2>
                <div className="mb-2 text-white font-semibold">{nextSession.title}</div>
                <div className="mb-4 text-purple-200">{nextSession.time}</div>
                <button className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-3 hover:from-pink-500 hover:to-purple-600 transition flex items-center justify-center gap-2"><img src="/images/free-speech-bubble-icon-875-thumb-removebg-preview.png" alt="" className="w-6 h-6" />Join Session</button>
              </div>
            </aside>
        </section>
    </main>
      </div>
  );
  }

  // Placeholder for non-student roles
  return <div>Dashboard for your role is coming soon.</div>;
}
