import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();
  const particlesRef = useRef<HTMLDivElement>(null);

  // Particle system
  useEffect(() => {
    const particlesContainer = particlesRef.current;
    if (!particlesContainer) return;
    particlesContainer.innerHTML = "";
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute w-[3px] h-[3px] bg-[rgba(212,173,252,0.6)] rounded-full animate-[particleFloat_15s_linear_infinite]";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 15 + "s";
      particle.style.animationDuration = (Math.random() * 10 + 10) + "s";
      particlesContainer.appendChild(particle);
    }
  }, []);

  // Parallax effect for floating shapes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shapes = document.querySelectorAll(".shape");
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = mouseX * speed * 20;
        const y = mouseY * speed * 20;
        (shape as HTMLElement).style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  async function handle(e: any) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    try {
      await api.post("/users", {
        name,
        email,
        password,
        registration_id: `REG-${Date.now()}`,
        user_id: Date.now()
      });
      r.push("/login?message=Account created successfully! Please log in.");
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErr("Email already exists");
      } else if (error.response?.data?.detail) {
        setErr(error.response.data.detail);
      } else {
        setErr("An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] via-[#1a0033] via-[#2d1b69] via-[#7209b7] to-[#a663cc] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#0a0015] via-[#1a0033] via-[#2d1b69] via-[#7209b7] to-[#a663cc] animate-[gradientShift_12s_ease_infinite] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(162,99,204,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(114,9,183,0.2)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(45,27,105,0.15)_0%,transparent_50%)] animate-[float_8s_ease-in-out_infinite]" />
      </div>
      {/* Floating Shapes */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="shape absolute w-[100px] h-[100px] bg-gradient-to-br from-[#7209b7] to-[#a663cc] rounded-full top-[10%] left-[10%] opacity-10 animate-[floatMove_25s_linear_infinite]" />
        <div className="shape absolute w-[80px] h-[80px] bg-gradient-to-br from-[#a663cc] to-[#d4adfc] top-[20%] right-[15%] opacity-10 animate-[floatMove_30s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '-5s' }} />
        <div className="shape absolute w-[60px] h-[60px] bg-gradient-to-br from-[#2d1b69] to-[#7209b7] top-[60%] left-[20%] opacity-10 animate-[floatMove_35s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', animationDelay: '-10s' }} />
        <div className="shape absolute w-[120px] h-[120px] bg-gradient-to-br from-[#1a0033] to-[#2d1b69] rounded-[20px] top-[40%] right-[25%] opacity-10 animate-[floatMove_28s_linear_infinite]" style={{ animationDelay: '-15s' }} />
      </div>
      {/* Particles */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none z-[-1]" />
      {/* Signup Container */}
      <div className="login-container bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] rounded-[30px] px-8 py-10 w-full max-w-xl border border-[rgba(162,99,204,0.3)] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[slideUp_0.6s_ease-out]">
        {/* Logo Section */}
        <div className="logo-section text-center mb-10">
          <div className="logo text-[3rem] mb-4">🎓</div>
          <div className="brand-name text-[2rem] font-extrabold bg-gradient-to-r from-white to-[#d4adfc] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(162,99,204,0.3)]">Pingin</div>
        </div>
        {/* Form Header */}
        <p className="subtitle text-[#d4adfc] text-sm mb-2 uppercase tracking-wider font-semibold text-center">Student Portal</p>
        <h1 className="title text-white text-3xl font-bold mb-8 leading-tight text-center">Create Account</h1>
        {/* Message Container */}
        {err && <div className="message error bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] p-4 rounded-xl mb-4 text-center text-sm">{err}</div>}
        {/* Signup Form */}
        <form onSubmit={handle} className="space-y-5">
          <div className="form-group">
            <label className="form-label text-[rgba(255,255,255,0.8)] text-base font-medium mb-2 block" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-xl text-base bg-[rgba(255,255,255,0.05)] text-white focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:ring-4 focus:ring-[#d4adfc]/10 placeholder:text-[rgba(255,255,255,0.5)] mb-2"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-[rgba(255,255,255,0.8)] text-base font-medium mb-2 block" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-xl text-base bg-[rgba(255,255,255,0.05)] text-white focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:ring-4 focus:ring-[#d4adfc]/10 placeholder:text-[rgba(255,255,255,0.5)] mb-2"
              placeholder="student@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-[rgba(255,255,255,0.8)] text-base font-medium mb-2 block" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-xl text-base bg-[rgba(255,255,255,0.05)] text-white focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:ring-4 focus:ring-[#d4adfc]/10 placeholder:text-[rgba(255,255,255,0.5)] mb-2"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-[rgba(255,255,255,0.8)] text-base font-medium mb-2 block" htmlFor="confirmPassword">Re-enter Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-xl text-base bg-[rgba(255,255,255,0.05)] text-white focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:ring-4 focus:ring-[#d4adfc]/10 placeholder:text-[rgba(255,255,255,0.5)] mb-2"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn w-full p-4 bg-gradient-to-r from-[#7209b7] to-[#a663cc] text-white border-none rounded-xl text-base font-semibold uppercase tracking-wide cursor-pointer transition-all mb-4 shadow-[0_10px_30px_rgba(114,9,183,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(114,9,183,0.5)] disabled:bg-[#a663cc]/60 flex items-center justify-center">
            <span className={loading ? "hidden" : "inline"}>Sign Up</span>
            {loading && <span className="loading inline-block w-5 h-5 border-4 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin ml-2"></span>}
          </button>
        </form>
        {/* Divider */}
        <div className="divider flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4adfc]/30 to-transparent" />
          <span className="px-4 py-1 text-[rgba(255,255,255,0.7)] text-sm font-medium bg-[rgba(255,255,255,0.05)] rounded-full border border-[#d4adfc]/20 backdrop-blur">OR</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4adfc]/30 to-transparent" />
        </div>
        {/* Google Sign Up */}
        <button className="google-btn w-full p-4 bg-[rgba(255,255,255,0.08)] border-2 border-[#d4adfc]/30 rounded-xl text-base font-medium flex items-center justify-center gap-3 transition-all mb-4 text-white backdrop-blur hover:border-[#d4adfc]/50 hover:bg-[rgba(255,255,255,0.12)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(114,9,183,0.2)]">
          <span className="google-icon w-5 h-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjY0IDkuMjM2OUMxNy42NCA4LjU5NjkgMTcuNTgyNyA3Ljk1MjkgMTcuNDY5MSA3LjMyOTNIMTBWMTAuODk1M0gxNC4zODU1QzE0LjIxOTEgMTEuNzUgMTMuNzU5MSAxMi41NDE0IDEzLjA5IDEzLjEwNTVWMTUuMjMxOEgxNS40MzE4QzE2LjcwOTEgMTQuMTEzNiAxNy42NCA2LjU0NTQgMTcuNjQgOS4yMzY5VjkuMjM2OVoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTkuOTk5OTggMTcuNDU0NkMxMi42NzI3IDE3LjQ1NDYgMTQuOTI3MyAxNi42MTM2IDE2LjQzMTggMTUuMjMxOEwxMy4wOTk5IDEzLjEwNTVDMTIuMzA5MSAxMy42MjczIDExLjMxMzYgMTMuOTEzNiA5Ljk5OTk4IDEzLjkxMzZDNy4xOTU0NCAxMy45MTM2IDUuNzA0NTMgMTIuMDE4MSA0Ljk2MzYyIDkuNjEzNjNIMi41ODE4VjExLjczMTdDNC4yNjM2MyAxNC44ODYzIDYuOTQ5OTggMTcuNDU0NiA5Ljk5OTk4IDE3LjQ1NDZaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik00Ljk2MzYxIDkuNjEzNjRDNC43NDU0NCA4LjcyNzI3IDQuNzQ1NDQgNy4yNzI3MyA0Ljk2MzYxIDYuMzg2MzZWNC4yNjgxOEgyLjU4MTgxQzEuNjEzNjMgNi4wNDU0NSAxLjYxMzYzIDguOTU0NTUgMi41ODE4MSA5LjczMTgyTDQuOTYzNjEgOS42MTM2NFoiIGZpbGw9IiNGQkJDMDUiLz4KPHBhdGggZD0iTTEwLjAwMDEgNi4wODY0QzExLjE4NjQgNi4wODY0IDEyLjI4MjkgNi41MDkxIDEzLjEzNjQgNy4zNTAzN0wxNS4yMzY0IDUuMjUwMzdDMTMuNTI3MyAzLjY1OTEgMTEuNDQxIDIuNzI3MyAxMC4wMDAxIDIuNzI3M0M2Ljk1MDEgMi43MjczIDQuMjYzNzMgNS4yOTU0NSAyLjU4MTgxIDguNDQ5OThMNC45NjM2MSA5LjYxMzYxQzUuNzA0NTMgNy4yMDkwOSA3LjE5NTQ1IDYuMDg2NCA5Ljk5OTk5IDYuMDg2NFoiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+Cg==')] bg-center bg-no-repeat bg-contain" />
          Continue with Google
        </button>
        {/* Log In Link */}
        <p className="signup-link text-center text-[rgba(255,255,255,0.7)] text-sm">
          Already have an account? <a href="/login" className="text-[#d4adfc] font-semibold hover:text-white hover:underline transition-all">Log in here</a>
        </p>
      </div>
      {/* Animations */}
      <style jsx global>{`
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 