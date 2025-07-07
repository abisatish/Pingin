import React, { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";

// Type definitions
interface Student {
  id: number;
  name: string;
  registration_id: string;
  gpa: number | null;
  photo_url: string | null;
  last_active: string | null;
  status: string;
}

interface Message {
  id: number;
  sender: string;
  student_name: string;
  message: string;
  time: string;
  unread: boolean;
  ping_id: number;
  ping_status: string;
}

interface DashboardData {
  role: string;
  consultant_id?: number;
  consultant_name?: string;
  students?: Student[];
  recent_messages?: Message[];
  pings?: any[];
  stats?: {
    active_students?: number;
    sessions_this_month?: number;
    pending_reviews?: number;
    hours_this_week?: number;
  };
}

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
  const { data } = useSWR<DashboardData>("/dashboard", fetcher);

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

  // Show consultant dashboard if user is a consultant
  if (data.role === "consultant") {
    return <ConsultantDashboard data={data} />;
  }

  // Show student dashboard (existing code)
  if (data.role === "student") {
    return <StudentDashboard data={data} />;
  }

  return <p>Loading...</p>;
}

// Consultant Dashboard Component
function ConsultantDashboard({ data }: { data: DashboardData }) {
  const [particles, setParticles] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    // Create particles
    const particleElements = [];
    for (let i = 0; i < 50; i++) {
      particleElements.push(
        <div
          key={i}
          className="absolute w-[3px] h-[3px] bg-[rgba(212,173,252,0.6)] rounded-full animate-[particleFloat_15s_linear_infinite]"
          style={{
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 15 + 's',
            animationDuration: (Math.random() * 10 + 10) + 's'
          }}
        />
      );
    }
    setParticles(particleElements);

    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
      const width = (bar as HTMLElement).style.width;
      (bar as HTMLElement).style.width = '0%';
      setTimeout(() => {
        (bar as HTMLElement).style.width = width;
      }, 100 * index);
    });
  }, []);

  return (
    <div className="min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-white overflow-x-hidden relative">
      {/* Background Animation */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#0a0015] via-[#1a0033] via-[#2d1b69] via-[#7209b7] to-[#a663cc] animate-[gradientShift_12s_ease_infinite] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(162,99,204,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(114,9,183,0.2)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(45,27,105,0.15)_0%,transparent_50%)] animate-[float_8s_ease-in-out_infinite]" />
      </div>

      {/* Floating Shapes */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute w-[100px] h-[100px] bg-gradient-to-br from-[#7209b7] to-[#a663cc] rounded-full top-[10%] left-[10%] opacity-10 animate-[floatMove_25s_linear_infinite]" />
        <div className="absolute w-[80px] h-[80px] bg-gradient-to-br from-[#a663cc] to-[#d4adfc] top-[20%] right-[15%] opacity-10 animate-[floatMove_30s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '-5s' }} />
        <div className="absolute w-[60px] h-[60px] bg-gradient-to-br from-[#2d1b69] to-[#7209b7] top-[60%] left-[20%] opacity-10 animate-[floatMove_35s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', animationDelay: '-10s' }} />
        <div className="absolute w-[120px] h-[120px] bg-gradient-to-br from-[#1a0033] to-[#2d1b69] rounded-[20px] top-[40%] right-[25%] opacity-10 animate-[floatMove_28s_linear_infinite]" style={{ animationDelay: '-15s' }} />
      </div>

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        {particles}
      </div>

      {/* Navigation */}
      <nav className="bg-[rgba(10,0,21,0.6)] backdrop-blur-[20px] border-b border-[rgba(162,99,204,0.2)] py-6 sticky top-0 z-[100]">
        <div className="max-w-[1600px] mx-auto px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[45px] h-[45px] flex items-center justify-center text-[1.8rem]">🎓</div>
            <div className="text-[1.6rem] font-bold bg-gradient-to-r from-white to-[#d4adfc] bg-clip-text text-transparent">Pingin</div>
          </div>
          <div className="text-[rgba(255,255,255,0.9)] text-[1.1rem] font-medium">Mentor Dashboard</div>
          <div className="flex items-center gap-6">
            <button className="w-[45px] h-[45px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-full text-white cursor-pointer flex items-center justify-center relative text-[1.3rem] transition-all duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-[2px]">
              🔔
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff4757] rounded-full border-2 border-[rgba(10,0,21,0.6)]" />
          </button>
            <button className="w-[45px] h-[45px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-full text-white cursor-pointer flex items-center justify-center text-[1.3rem] transition-all duration-300 hover:bg-[rgba(255,255,255,0.2)] hover:-translate-y-[2px]">⚙️</button>
            <div className="w-[45px] h-[45px] bg-gradient-to-br from-[#7209b7] to-[#a663cc] rounded-full flex items-center justify-center text-white text-[1.2rem] font-semibold cursor-pointer transition-all duration-300 hover:scale-105">MK</div>
          </div>
            </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-12 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 py-8">
          <h1 className="text-[3.5rem] font-extrabold mb-4 bg-gradient-to-r from-white to-[#d4adfc] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(162,99,204,0.3)]">Welcome back, {data.consultant_name || 'Mentor'}!</h1>
          <p className="text-[rgba(255,255,255,0.85)] text-[1.25rem] max-w-[700px] mx-auto leading-[1.6]">Track your mentoring progress, manage students, and stay connected with your mentees.</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard label="Active Students" icon="👥" number={data.stats?.active_students?.toString() || "0"} progress={80} />
          <StatCard label="Sessions This Month" icon="📅" number={data.stats?.sessions_this_month?.toString() || "0"} progress={72} />
          <StatCard label="Pending Reviews" icon="⏳" number={data.stats?.pending_reviews?.toString() || "0"} progress={35} />
          <StatCard label="Hours This Week" icon="⏰" number={data.stats?.hours_this_week?.toString() || "0"} progress={60} />
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <RecentStudents />
          <RecentMessages />
    </div>

        {/* Upcoming Sessions & Student Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <UpcomingSessions />
          <StudentProgress />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </main>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(15deg) brightness(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-30px) rotate(3deg); opacity: 1; }
        }
        
        @keyframes floatMove {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-100px) translateX(50px) rotate(90deg); }
          50% { transform: translateY(-200px) translateX(-30px) rotate(180deg); }
          75% { transform: translateY(-150px) translateX(80px) rotate(270deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(100px); opacity: 0; }
        }
      `}</style>
      </div>
    );
  }

// Component Functions for Consultant Dashboard
function StatCard({ label, icon, number, progress }: { label: string; icon: string; number: string; progress: number }) {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)] group">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[2.5rem]">{icon}</div>
        <div className="text-[rgba(255,255,255,0.6)] text-[0.9rem] font-medium">{label}</div>
      </div>
      <div className="text-[2.5rem] font-bold text-white mb-4">{number}</div>
      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2 overflow-hidden">
        <div 
          className="progress-fill h-full bg-gradient-to-r from-[#7209b7] to-[#a663cc] rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function RecentStudents() {
  const { data } = useSWR("/dashboard", fetcher);
  const students = data?.students || [];

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)]">
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <img src="/images/graduation-cap.png" alt="Students" className="w-8 h-8" />
          </div>
          <h2 className="text-[1.5rem] font-bold text-white">Recent Students</h2>
        </div>
        <button className="text-[#a663cc] text-[0.9rem] font-medium hover:text-[#d4adfc] transition-colors">View All</button>
                  </div>
      <div className="space-y-6">
        {students.length > 0 ? (
          students.slice(0, 4).map((student: Student, index: number) => (
            <div key={student.id} className="flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.03)] rounded-[12px] border border-[rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.2)]">
              <div className="w-[50px] h-[50px] bg-gradient-to-br from-[#7209b7] to-[#a663cc] rounded-full flex items-center justify-center text-white text-[1.1rem] font-semibold">
                {getInitials(student.name || 'Student')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{student.name || 'Student'}</h3>
                  <span className="px-2 py-1 rounded-full text-[0.75rem] font-medium bg-[rgba(46,213,115,0.2)] text-[#2ed573]">
                    {student.status || 'Active'}
                  </span>
        </div>
                <p className="text-[rgba(255,255,255,0.6)] text-[0.85rem]">
                  {student.last_active ? formatTimeAgo(student.last_active) : 'Recently active'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{student.gpa || 'N/A'}</div>
                <div className="text-[rgba(255,255,255,0.6)] text-[0.8rem]">GPA</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-[rgba(255,255,255,0.6)] py-8">
            No students assigned yet
            </div>
        )}
          </div>
        </div>
  );
}

function RecentMessages() {
  const { data } = useSWR("/dashboard", fetcher);
  const messages = data?.recent_messages || [];
  const router = useRouter();

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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

  const handlePingClick = (pingId: number) => {
    router.push(`/ping/${pingId}`);
  };

  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <img src="/images/message-circle-1.png" alt="Messages" className="w-8 h-8" />
          </div>
          <h2 className="text-[1.5rem] font-bold text-white">Recent Messages</h2>
        </div>
        <button className="text-[#a663cc] text-[0.9rem] font-medium hover:text-[#d4adfc] transition-colors">View All</button>
      </div>
      <div className="space-y-6">
        {messages.length > 0 ? (
          messages.slice(0, 4).map((message: Message, index: number) => (
            <div 
              key={message.id} 
              className={`p-4 rounded-[12px] border transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.2)] cursor-pointer ${
                message.unread 
                  ? 'bg-[rgba(162,99,204,0.1)] border-[rgba(162,99,204,0.3)]' 
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'
              }`}
              onClick={() => handlePingClick(message.ping_id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#7209b7] to-[#a663cc] rounded-full flex items-center justify-center text-white text-[0.9rem] font-semibold">
                  {getInitials(message.student_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{message.student_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.ping_status)} text-white`}>
                      {getStatusText(message.ping_status)}
                    </span>
                    {message.unread && (
                      <div className="w-2 h-2 bg-[#a663cc] rounded-full" />
                    )}
                  </div>
                  <p className="text-[rgba(255,255,255,0.8)] text-[0.9rem] mb-2">{message.message}</p>
                  <p className="text-[rgba(255,255,255,0.5)] text-[0.8rem]">{formatTimeAgo(message.time)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-[rgba(255,255,255,0.6)] py-8">
            No recent messages
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingSessions() {
  const sessions = [
    { student: "Sarah Johnson", time: "Today, 2:00 PM", duration: "45 min", type: "Essay Review" },
    { student: "Michael Chen", time: "Tomorrow, 10:00 AM", duration: "30 min", type: "Study Session" },
    { student: "Emma Davis", time: "Wednesday, 3:30 PM", duration: "60 min", type: "Project Discussion" },
    { student: "Alex Thompson", time: "Friday, 1:00 PM", duration: "45 min", type: "Reading Discussion" }
  ];

  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <img src="/images/clock.png" alt="Sessions" className="w-8 h-8" />
          </div>
          <h2 className="text-[1.5rem] font-bold text-white">Upcoming Sessions</h2>
        </div>
        <button className="text-[#a663cc] text-[0.9rem] font-medium hover:text-[#d4adfc] transition-colors">Schedule</button>
      </div>
      <div className="space-y-6">
        {sessions.map((session, index) => (
          <div key={index} className="p-4 bg-[rgba(255,255,255,0.03)] rounded-[12px] border border-[rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{session.student}</h3>
              <span className="text-[rgba(255,255,255,0.6)] text-[0.85rem]">{session.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[rgba(255,255,255,0.8)] text-[0.9rem]">{session.type}</p>
                <p className="text-[rgba(255,255,255,0.6)] text-[0.8rem]">{session.time}</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-[#7209b7] to-[#a663cc] text-white text-[0.85rem] font-medium rounded-[8px] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(162,99,204,0.3)]">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentProgress() {
  const students = [
    { name: "Sarah Johnson", subject: "English Literature", progress: 85, grade: "A-" },
    { name: "Michael Chen", subject: "Mathematics", progress: 72, grade: "B+" },
    { name: "Emma Davis", subject: "History", progress: 45, grade: "C" },
    { name: "Alex Thompson", subject: "Science", progress: 93, grade: "A" }
  ];

  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <img src="/images/book-open-1.png" alt="Progress" className="w-8 h-8" />
          </div>
          <h2 className="text-[1.5rem] font-bold text-white">Student Progress</h2>
        </div>
        <button className="text-[#a663cc] text-[0.9rem] font-medium hover:text-[#d4adfc] transition-colors">View All</button>
      </div>
      <div className="space-y-6">
        {students.map((student, index) => (
          <div key={index} className="p-4 bg-[rgba(255,255,255,0.03)] rounded-[12px] border border-[rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{student.name}</h3>
              <span className="px-3 py-1 bg-[rgba(162,99,204,0.2)] text-[#a663cc] text-[0.85rem] font-medium rounded-full">
                {student.grade}
              </span>
            </div>
            <p className="text-[rgba(255,255,255,0.7)] text-[0.9rem] mb-4">{student.subject}</p>
            <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-[#7209b7] to-[#a663cc] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${student.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[0.85rem]">
              <span className="text-[rgba(255,255,255,0.6)]">Progress</span>
              <span className="text-white font-semibold">{student.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { title: "Schedule Session", icon: "📅", color: "from-[#7209b7] to-[#a663cc]" },
    { title: "Send Message", icon: "💬", color: "from-[#2ed573] to-[#7bed9f]" },
    { title: "Review Assignment", icon: "📝", color: "from-[#ffa502] to-[#ffb142]" },
    { title: "View Reports", icon: "📊", color: "from-[#3742fa] to-[#5352ed]" }
  ];

  return (
    <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(162,99,204,0.15)]">
      <h2 className="text-[1.5rem] font-bold text-white mb-8">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <button key={index} className="group p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[16px] transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(162,99,204,0.3)] hover:scale-105 hover:shadow-[0_12px_30px_rgba(162,99,204,0.2)]">
            <div className={`w-[60px] h-[60px] bg-gradient-to-br ${action.color} rounded-[16px] flex items-center justify-center text-white text-[1.8rem] mb-4 transition-all duration-300 group-hover:scale-110`}>
              {action.icon}
            </div>
            <h3 className="text-white font-semibold text-[1rem]">{action.title}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}

// Student Dashboard Component (existing code)
function StudentDashboard({ data }: { data: any }) {
  const [successMessage, setSuccessMessage] = useState("");

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
