import React from "react";
import useSWR, { useSWRConfig } from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

type Application = { 
  college_id: number; 
  college: string; 
  major: string;
  status?: string;
  consultant_id?: number;
  consultant_name?: string;
  match_score?: number;
};
type Essay = { id: number; prompt: string };

type CreatePingSectionProps = {
  studentId: number;
  token: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const { data } = useSWR("/dashboard", fetcher);

  useEffect(() => {
    // Check for success message from quiz completiony
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
              <CreatePingSection studentId={data.id} token={data.token} />

              {/* Upcoming Tasks */}
              <TasksSection />

              {/* College List */}
              <CollegeListSection applications={data.applications || []} />
            </div>

            {/* Sidebar (1/3) */}
            <aside className="flex flex-col gap-8">
              {/* Recent Pings */}
              <RecentPingsSection />
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

function CreatePingSection({ studentId, token }: CreatePingSectionProps) {
  const { data: dashboardData } = useSWR("/dashboard", fetcher);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [mentor, setMentor] = useState<number | null>(null);
  const [mentorName, setMentorName] = useState<string>("");
  const [pingNotes, setPingNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // SWR config for mutations
  const { mutate } = useSWRConfig();

  // Get applications from dashboard data
  const applications = dashboardData?.applications || [];

  // When a college is selected, fetch its dashboard for mentor and essays
  useEffect(() => {
    if (!selectedApp) return;
    setEssays([]);
    setMentor(null);
    setMentorName("");
    setSelectedEssay(null);
    api
      .get(`/college/${selectedApp.college_id}/dashboard`)
      .then((res) => {
        console.log("College dashboard response:", res.data);
        const consultantId = res.data.college.consultant_id ?? null;
        setMentor(consultantId);
        setEssays(res.data.essays || []);
        console.log("Essays found:", res.data.essays || []);
        // Fetch consultant name if consultant is assigned
        if (consultantId) {
          api.get(`/consultants/${consultantId}`)
            .then((consultantRes) => {
              setMentorName(consultantRes.data.name);
            })
            .catch((err) => {
              console.error("Failed to fetch consultant name:", err);
              setMentorName("Unknown Consultant");
            });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch college dashboard:", err);
      });
  }, [selectedApp]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedApp || !pingNotes || !selectedEssay) {
      alert("Please fill in College, Essay, and Ping notes");
      return;
    }
    
    // Check if we have a token
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in again.");
      return;
    }
    
    setLoading(true);
    try {
      // Get current user info to ensure we have the correct student ID
      const userResponse = await api.get("/dashboard");
      const currentStudentId = userResponse.data.student_id;
      
      const pingData = {
        application_id: selectedApp.college_id,
        student_id: currentStudentId,
        question: pingNotes.trim(),
        essay_id: selectedEssay.id,
        ...(mentor && { consultant_id: mentor })
      };
      
      console.log("Current user data:", userResponse.data);
      console.log("Submitting ping with data:", pingData);
      console.log("Using token:", token ? "Token available" : "No token");
      console.log("Data types:", {
        application_id: typeof pingData.application_id,
        question: typeof pingData.question,
        consultant_id: typeof pingData.consultant_id,
        essay_id: typeof pingData.essay_id,
      });
      
      const response = await api.post("/pings/", pingData);
      
      console.log("Ping submitted successfully:", response.data);
      setSuccess(true);
      setPingNotes("");
      setSelectedApp(null);
      setSelectedEssay(null);
      setMentor(null);
      setEssays([]);
      
      // Refresh dashboard data to update recent pings
      await mutate("/dashboard");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to create ping:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Full error object:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to create ping.";
      alert(`Error: ${errorMessage}`);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <img src="/images/unnamed-2.png" alt="" className="w-8 h-8" />
        <h2 className="text-xl font-bold text-white">Create Pings</h2>
      </div>
      {!dashboardData ? (
        <div className="text-purple-200 text-center py-4">Loading applications...</div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* College Dropdown */}
          <select
            className="rounded-lg bg-white/10 border border-white/10 p-3 text-white"
            value={selectedApp?.college_id || ""}
            onChange={(e) => {
              const app = applications.find(
                (a: Application) => a.college_id === Number(e.target.value)
              );
              setSelectedApp(app || null);
            }}
          >
            <option value="">Select College</option>
            {applications.length > 0 ? (
              applications.map((app: Application) => (
                <option key={app.college_id} value={app.college_id}>
                  {app.college}
                </option>
              ))
            ) : (
              <option value="" disabled>No colleges added yet. Add colleges first!</option>
            )}
          </select>

          {/* Mentor Autofill */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-white">
            <span className="font-semibold">Assigned Mentor: </span>
            {mentor !== null ? (
              mentorName ? (
                <span className="text-green-300">{mentorName}</span>
              ) : (
                <span className="text-yellow-300">Loading consultant name... (ID: {mentor})</span>
              )
            ) : (
              <span className="text-gray-400">No consultant assigned yet</span>
            )}
          </div>

          {/* Essay Dropdown */}
          <select
            className="rounded-lg bg-white/10 border border-white/10 p-3 text-white"
            value={selectedEssay?.id || ""}
            onChange={(e) => {
              const essay = essays.find(
                (es) => String(es.id) === e.target.value
              );
              setSelectedEssay(essay || null);
            }}
          >
            <option value="">Choose Your Essay (Optional)</option>
            {essays.length > 0 ? (
              essays.map((essay) => (
                <option key={essay.id} value={essay.id}>
                  {essay.prompt}
                </option>
              ))
            ) : (
              <option value="" disabled>No essays available yet</option>
            )}
          </select>

          {/* Ping Notes */}
          <textarea
            className="rounded-lg bg-white/10 border border-white/10 p-3 text-white"
            placeholder="Ping notes (your question for the mentor)"
            value={pingNotes}
            onChange={(e) => setPingNotes(e.target.value)}
            rows={3}
          />

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-3 hover:from-pink-500 hover:to-purple-600 transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Ping"}
          </button>
          {success && (
            <div className="text-green-400 font-semibold mt-2">
              Ping sent successfully!
            </div>
          )}
        </form>
      )}
    </div>
  );
}

function TasksSection() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [creating, setCreating] = useState(false);
  
  // SWR config for mutations
  const { mutate } = useSWRConfig();

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");
        setTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Handle task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert("Please enter a task description");
      return;
    }

    setCreating(true);
    try {
      const taskData = {
        title: newTaskTitle.trim(),
        due_date: newTaskDate ? new Date(newTaskDate).toISOString() : null,
        priority: "medium",
        category: "general"
      };

      const response = await api.post("/tasks/", taskData);
      setTasks(prev => [response.data, ...prev]);
      setNewTaskTitle("");
      setNewTaskDate("");
      
      // Refresh dashboard data to update tasks
      await mutate("/dashboard");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: number) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Refresh dashboard data to update tasks
      await mutate("/dashboard");
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("Failed to complete task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/clock.png" alt="" className="w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Upcoming Tasks</h2>
          </div>
        </div>
        <div className="text-purple-200">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/images/clock.png" alt="" className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Upcoming Tasks</h2>
        </div>
        <a href="#" className="text-purple-200 hover:text-white font-semibold">View All</a>
      </div>
      
      <div className="flex flex-col gap-3">
        {tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length === 0 ? (
          <div className="text-purple-200 text-center py-4">No tasks yet. Create your first task below!</div>
        ) : (
          tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').map((task) => (
            <div key={task.id} className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition">
              <div className="flex items-center gap-4">
                <img 
                  src={task.priority === "high" || task.priority === "urgent" ? "/images/circle-alert.png" : "/images/check.png"} 
                  alt="" 
                  className="w-6 h-6" 
                />
                <div>
                  <div className="text-white font-semibold">{task.title}</div>
                  <div className="text-purple-200 text-sm">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="text-green-400 hover:text-green-300 text-sm font-semibold"
                >
                  Complete
                </button>
                <span className="text-2xl text-purple-300">&gt;</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-bold text-white mb-2">Create a New Task</h3>
        <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-2">
          <input 
            type="text" 
            placeholder="Task Description" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white placeholder-purple-200" 
          />
          <input 
            type="date" 
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white placeholder-purple-200" 
          />
          <button 
            type="submit" 
            disabled={creating}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-3 hover:from-pink-500 hover:to-purple-600 transition disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CollegeListSection({ applications }: { applications: Application[] }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [collegeApplications, setCollegeApplications] = useState(applications);
  const [newCollege, setNewCollege] = useState("");
  const [newMajor, setNewMajor] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [popularColleges, setPopularColleges] = useState<string[]>([]);
  const [popularMajors, setPopularMajors] = useState<string[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  
  // SWR config for mutations
  const { mutate } = useSWRConfig();

  // Update local state when props change
  useEffect(() => {
    setCollegeApplications(applications);
  }, [applications]);

  // Fetch popular colleges and majors
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        console.log("Fetching popular colleges and majors...");
        const [collegesResponse, majorsResponse] = await Promise.all([
          api.get("/college-selection/popular-colleges"),
          api.get("/college-selection/popular-majors")
        ]);
        console.log("Colleges response:", collegesResponse.data);
        console.log("Majors response:", majorsResponse.data);
        setPopularColleges(collegesResponse.data.colleges);
        setPopularMajors(majorsResponse.data.majors);
      } catch (error) {
        console.error("Failed to fetch popular lists:", error);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchLists();
  }, []);

  const getMajorCategory = (major: string): string => {
    const stemMajors = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const humanitiesMajors = ['English', 'History', 'Philosophy', 'Literature'];
    const businessMajors = ['Business Administration', 'Finance', 'Economics'];
    const artsMajors = ['Art', 'Music', 'Theater', 'Film'];
    const healthMajors = ['Pre-Medicine', 'Nursing', 'Public Health'];
    const educationMajors = ['Education', 'Teaching'];
    const socialSciencesMajors = ['Political Science', 'Sociology', 'Psychology'];

    if (stemMajors.some(m => major.includes(m))) return 'STEM';
    if (humanitiesMajors.some(m => major.includes(m))) return 'Humanities';
    if (businessMajors.some(m => major.includes(m))) return 'Business';
    if (artsMajors.some(m => major.includes(m))) return 'Arts';
    if (healthMajors.some(m => major.includes(m))) return 'Health';
    if (educationMajors.some(m => major.includes(m))) return 'Education';
    if (socialSciencesMajors.some(m => major.includes(m))) return 'Social Sciences';
    return 'Other';
  };

  const handleAddCollege = async () => {
    if (!newCollege.trim() || !newMajor.trim()) {
      alert("Please enter both college name and major");
      return;
    }

    setAdding(true);
    try {
      const requestData = {
        college_name: newCollege.trim(),
        major: newMajor.trim(),
        major_category: getMajorCategory(newMajor.trim())
      };
      
      console.log("Creating college application with data:", requestData);
      const response = await api.post("/college-selection/", requestData);
      console.log("College creation response:", response.data);
      
      setCollegeApplications(prev => [...prev, response.data]);
      setNewCollege("");
      setNewMajor("");
      
      // Refresh dashboard data to update applications list
      await mutate("/dashboard");
      
      // Show success message with mentor assignment
      if (response.data.consultant_name) {
        alert(`✅ ${newCollege.trim()} added successfully!\n\n🎓 Your mentor: ${response.data.consultant_name}\n📊 Match score: ${Math.round(response.data.match_score * 100)}%`);
      } else {
        alert(`✅ ${newCollege.trim()} added successfully!\n\n⏳ We're finding the perfect mentor for you. Check back soon!`);
      }
    } catch (error) {
      console.error("Failed to add college:", error);
      alert("Failed to add college. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollege = async (applicationId: number) => {
    if (!confirm("⚠️ WARNING: Removing this college will permanently delete all associated essays, pings, and feedback. This action cannot be undone. Are you sure you want to continue?")) {
      return;
    }

    setRemovingId(applicationId);
    try {
      await api.delete(`/college-selection/${applicationId}`);
      setCollegeApplications(prev => prev.filter(app => app.college_id !== applicationId));
      
      // Refresh dashboard data to update applications list
      await mutate("/dashboard");
    } catch (error) {
      console.error("Failed to remove college:", error);
      alert("Failed to remove college. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const getCollegeType = (collegeName: string) => {
    // This is a simple heuristic - in a real app, you'd have a database of college types
    const reachColleges = ["Harvard", "Stanford", "MIT", "Yale", "Princeton", "Columbia", "UPenn", "Duke", "Brown", "Cornell"];
    const safetyColleges = ["University of Washington", "Penn State", "Rutgers", "Indiana University"];
    
    if (reachColleges.some(name => collegeName.includes(name))) return "REACH";
    if (safetyColleges.some(name => collegeName.includes(name))) return "SAFETY";
    return "TARGET";
  };

  return (
    <>
      <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/graduation-cap.png" alt="" className="w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Your College List</h2>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="text-purple-200 hover:text-white font-semibold"
          >
            Edit List
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {collegeApplications.length === 0 ? (
            <div className="text-purple-200 text-center py-4">No colleges added yet. Click "Edit List" to add your first college!</div>
          ) : (
            collegeApplications.map((college) => (
              <div key={college.college_id} className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{college.college}</div>
                  <div className="text-purple-200 text-sm">
                    Major: {college.major} • Status: {college.status || "Draft"}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  getCollegeType(college.college) === 'REACH' ? 'bg-pink-500 text-white' : 
                  getCollegeType(college.college) === 'TARGET' ? 'bg-yellow-400 text-white' : 
                  'bg-green-500 text-white'
                }`}>
                  {getCollegeType(college.college)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#18181b] rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit College List</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-purple-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Add New College */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Add New College</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white"
                  disabled={loadingLists}
                >
                  <option value="">Select College</option>
                  {popularColleges.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
                <select
                  value={newMajor}
                  onChange={(e) => setNewMajor(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 border border-white/10 p-3 text-white"
                  disabled={loadingLists}
                >
                  <option value="">Select Major</option>
                  {popularMajors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddCollege}
                  disabled={adding || !newCollege || !newMajor}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-3 hover:from-pink-500 hover:to-purple-600 transition disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
              {loadingLists && (
                <div className="text-purple-200 text-sm mt-2">Loading colleges and majors...</div>
              )}
            </div>

            {/* Current Colleges */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Current Colleges</h3>
              <div className="flex flex-col gap-3">
                {collegeApplications.map((college) => (
                  <div key={college.college_id} className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{college.college}</div>
                      <div className="text-purple-200 text-sm">Major: {college.major}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveCollege(college.college_id)}
                      disabled={removingId === college.college_id}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold disabled:opacity-50"
                    >
                      {removingId === college.college_id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg bg-purple-600 text-white font-bold px-6 py-3 hover:bg-purple-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RecentPingsSection() {
  const { data } = useSWR("/dashboard", fetcher);
  const router = useRouter();

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

  const handlePingClick = (pingId: number) => {
    console.log("Ping clicked with ID:", pingId);
    console.log("Router object:", router);
    console.log("Attempting to navigate to:", `/ping/${pingId}`);
    router.push(`/ping/${pingId}`);
  };

  if (!data) {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/message-circle-1.png" alt="" className="w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Recent Pings</h2>
          </div>
        </div>
        <div className="text-purple-200">Loading pings...</div>
      </div>
    );
  }

  const pings = data.pings || [];
  
  console.log("Pings data:", pings);
  console.log("Pings length:", pings.length);

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/images/message-circle-1.png" alt="" className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Recent Pings</h2>
        </div>
        <a href="#" className="text-purple-200 hover:text-white font-semibold">View All</a>
      </div>
      
      <div className="flex flex-col gap-3">
        {pings.length === 0 ? (
          <div className="text-purple-200 text-center py-4">No pings yet. Create your first ping!</div>
        ) : (
          pings.map((ping: any) => (
            <div 
              key={ping.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              onClick={() => {
                console.log("Ping div clicked!");
                handlePingClick(ping.id);
              }}
            >
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(ping.status)}`}></span>
                {ping.status === 'answered' && (
                  <span className="text-yellow-400 text-xs">⭐</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">
                  {ping.question.length > 50 ? `${ping.question.substring(0, 50)}...` : ping.question}
                </div>
                <div className="text-purple-200 text-xs mt-1">
                  {ping.application?.college_name} • {getStatusText(ping.status)} • {formatTime(ping.created_at)}
                </div>
                {ping.answer && (
                  <div className="text-purple-300 text-xs mt-1 truncate">
                    A: {ping.answer.length > 40 ? `${ping.answer.substring(0, 40)}...` : ping.answer}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
