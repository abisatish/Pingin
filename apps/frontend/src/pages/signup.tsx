import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create particles effect
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
        for (let i = 0; i < 30; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute w-[3px] h-[3px] bg-[rgba(212,173,252,0.6)] rounded-full animate-[particleFloat_15s_linear_infinite]';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 15 + 's';
          particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
          particlesContainer.appendChild(particle);
        }
      }
    };

    createParticles();
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shapes = document.querySelectorAll('.shape');
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = mouseX * speed * 20;
        const y = mouseY * speed * 20;
        (shape as HTMLElement).style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setErr("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/users", { 
        name, 
        email, 
        password,
        registration_id: `REG-${Date.now()}`, // Generate a unique registration ID
        user_id: Date.now() // Generate a unique user ID
      });
      
      // After successful signup, redirect to login
      router.push("/login?message=Account created successfully! Please log in.");
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
    <div className="min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-white overflow-x-hidden relative">
      {/* Background Animation - Different color scheme */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] via-[#4c1d6f] via-[#8b5cf6] to-[#c084fc] animate-[gradientShift_12s_ease_infinite] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(192,132,252,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.2)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(76,29,111,0.15)_0%,transparent_50%)] animate-[float_8s_ease-in-out_infinite]" />
      </div>

      {/* Floating Shapes - Different colors and positions */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="shape absolute w-[120px] h-[120px] bg-gradient-to-br from-[#8b5cf6] to-[#c084fc] rounded-full top-[15%] left-[15%] opacity-10 animate-[floatMove_28s_linear_infinite]" />
        <div className="shape absolute w-[90px] h-[90px] bg-gradient-to-br from-[#c084fc] to-[#e9d5ff] top-[25%] right-[20%] opacity-10 animate-[floatMove_32s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '-8s' }} />
        <div className="shape absolute w-[70px] h-[70px] bg-gradient-to-br from-[#4c1d6f] to-[#8b5cf6] top-[70%] left-[25%] opacity-10 animate-[floatMove_38s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', animationDelay: '-12s' }} />
        <div className="shape absolute w-[140px] h-[140px] bg-gradient-to-br from-[#2d1b4e] to-[#4c1d6f] rounded-[25px] top-[35%] right-[30%] opacity-10 animate-[floatMove_30s_linear_infinite]" style={{ animationDelay: '-18s' }} />
      </div>

      {/* Particles */}
      <div id="particles" className="fixed inset-0 pointer-events-none z-[-1]" />

      {/* Signup Container - Different styling */}
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[25px] border border-[rgba(192,132,252,0.4)] rounded-[35px] p-12 w-full max-w-[650px] relative overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.4)] animate-[slideUp_0.6s_ease-out]">
          {/* Shimmer effect - Different color */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[rgba(192,132,252,0.9)] to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />

          {/* Logo Section - Different styling */}
          <div className="text-center mb-12">
            <div className="text-[3.5rem] mb-4">🚀</div>
            <div className="text-[2.2rem] font-extrabold bg-gradient-to-r from-white to-[#e9d5ff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(192,132,252,0.4)]">Pingin</div>
          </div>

          {/* Form Header - Different text */}
          <p className="text-[#e9d5ff] text-[0.9rem] mb-3 text-center uppercase tracking-[2px] font-semibold">Join Our Community</p>
          <h1 className="text-[2.2rem] font-bold text-white mb-10 text-center leading-tight">Start Your Journey</h1>

          {/* Message Container */}
          {err && (
            <div className="p-4 rounded-xl mb-6 text-center text-[0.9rem] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5]">
              {err}
            </div>
          )}

          {/* Signup Form - Different layout */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[rgba(255,255,255,0.9)] text-[0.95rem] font-medium mb-3 block" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 border-2 border-[rgba(192,132,252,0.4)] rounded-[18px] text-base bg-[rgba(255,255,255,0.08)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.6)] focus:border-[#e9d5ff] focus:bg-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_4px_rgba(233,213,255,0.15)]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="text-[rgba(255,255,255,0.9)] text-[0.95rem] font-medium mb-3 block" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border-2 border-[rgba(192,132,252,0.4)] rounded-[18px] text-base bg-[rgba(255,255,255,0.08)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.6)] focus:border-[#e9d5ff] focus:bg-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_4px_rgba(233,213,255,0.15)]"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[rgba(255,255,255,0.9)] text-[0.95rem] font-medium mb-3 block" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-2 border-[rgba(192,132,252,0.4)] rounded-[18px] text-base bg-[rgba(255,255,255,0.08)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.6)] focus:border-[#e9d5ff] focus:bg-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_4px_rgba(233,213,255,0.15)]"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label className="text-[rgba(255,255,255,0.9)] text-[0.95rem] font-medium mb-3 block" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 border-2 border-[rgba(192,132,252,0.4)] rounded-[18px] text-base bg-[rgba(255,255,255,0.08)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.6)] focus:border-[#e9d5ff] focus:bg-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_4px_rgba(233,213,255,0.15)]"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-5 bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white border-none rounded-[20px] text-lg font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-300 mt-8 shadow-[0_15px_40px_rgba(139,92,246,0.4)] hover:translate-y-[-3px] hover:shadow-[0_20px_50px_rgba(139,92,246,0.6)] active:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider - Different styling */}
          <div className="flex items-center gap-6 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(233,213,255,0.4)] to-transparent" />
            <span className="px-6 py-3 text-[rgba(255,255,255,0.8)] text-[0.9rem] font-medium bg-[rgba(255,255,255,0.08)] rounded-[25px] border border-[rgba(233,213,255,0.3)] backdrop-blur-[15px]">
              OR
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(233,213,255,0.4)] to-transparent" />
          </div>

          {/* Google Sign Up - Different styling */}
          <button className="w-full p-5 bg-[rgba(255,255,255,0.1)] border-2 border-[rgba(233,213,255,0.4)] rounded-[20px] text-lg font-medium cursor-pointer flex items-center justify-center gap-4 transition-all duration-300 mb-8 text-white backdrop-blur-[15px] hover:border-[rgba(233,213,255,0.6)] hover:bg-[rgba(255,255,255,0.15)] hover:translate-y-[-2px] hover:shadow-[0_12px_35px_rgba(139,92,246,0.3)]">
            <div className="w-6 h-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjY0IDkuMjM2OUMxNy42NCA4LjU5NjkgMTcuNTgyNyA3Ljk1MjkgMTcuNDY5MSA3LjMyOTNIMTBWMTAuODk1M0gxNC4zODU1QzE0LjIxOTEgMTEuNzUgMTMuNzU5MSAxMi41NDE0IDEzLjA5IDEzLjEwNTVWMTUuMjMxOEgxNS40MzE4QzE2LjcwOTEgMTQuMTEzNiAxNy42NCA2LjU0NTQgMTcuNjQgOS4yMzY5VjkuMjM2OVoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTkuOTk5OTggMTcuNDU0NkMxMi42NzI3IDE3LjQ1NDYgMTQuOTI3MyAxNi42MTM2IDE2LjQzMTggMTUuMjMxOEwxMy4wOTk5IDEzLjEwNTVDMTIuMzA5MSAxMy42MjczIDExLjMxMzYgMTMuOTEzNiA5Ljk5OTk4IDEzLjkxMzZDNy4xOTU0NCAxMy45MTM2IDUuNzA0NTMgMTIuMDE4MSA0Ljk2MzYyIDkuNjEzNjNIMi41ODE4VjExLjczMTdDNC4yNjM2MyAxNC44ODYzIDYuOTQ5OTggMTcuNDU0NiA5Ljk5OTk4IDE3LjQ1NDZaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik00Ljk2MzYxIDkuNjEzNjRDNC43NDU0NCA4LjcyNzI3IDQuNzQ1NDQgNy4yNzI3MyA0Ljk2MzYxIDYuMzg2MzZWNC4yNjgxOEgyLjU4MTgxQzEuNjEzNjMgNi4wNDU0NSAxLjYxMzYzIDguOTU0NTUgMi41ODE4MSA5LjczMTgyTDQuOTYzNjEgOS42MTM2NFoiIGZpbGw9IiNGQkJDMDUiLz4KPHBhdGggZD0iTTEwLjAwMDEgNi4wODY0QzExLjE4NjQgNi4wODY0IDEyLjI4MjkgNi41MDkxIDEzLjEzNjQgNy4zNTAzN0wxNS4yMzY0IDUuMjUwMzdDMTMuNTI3MyAzLjY1OTEgMTEuNDQxIDIuNzI3MyAxMC4wMDAxIDIuNzI3M0M2Ljk1MDEgMi43MjczIDQuMjYzNzMgNS4yOTU0NSAyLjU4MTgxIDguNDQ5OThMNC45NjM2MSA5LjYxMzYxQzUuNzA0NTMgNy4yMDkwOSA3LjE5NTQ1IDYuMDg2NCA5Ljk5OTk5IDYuMDg2NFoiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+Cg==')] bg-center bg-contain bg-no-repeat" />
            Continue with Google
          </button>

          {/* Login Link - Different styling */}
          <p className="text-center text-[rgba(255,255,255,0.8)] text-[0.95rem]">
            Already have an account? <a href="/login" className="text-[#e9d5ff] font-semibold transition-all duration-300 hover:text-white hover:underline">Log in here</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(20deg) brightness(1.1); }
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
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 