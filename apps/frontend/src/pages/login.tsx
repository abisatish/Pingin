import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for success message from signup
  useEffect(() => {
    const message = router.query.message as string;
    if (message) {
      setSuccess(message);
      // Clear the query parameter
      router.replace("/login", undefined, { shallow: true });
    }
  }, [router.query.message]);

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
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);

      // Try student quiz completion check first
      try {
        const quizResponse = await api.get("/matching-quiz/check-completion");
        const { quiz_completed, role } = quizResponse.data;
        if (role === "consultant") {
          // If consultant, check consultant quiz completion endpoint
          const consultantQuizRes = await api.get("/consultant-matching-quiz/check-completion");
          if (consultantQuizRes.data.quiz_completed) {
            router.push("/dashboard");
          } else {
            router.push("/matching-quiz");
          }
        } else {
          // Student flow
          if (quiz_completed) {
            router.push("/dashboard");
          } else {
            router.push("/matching-quiz");
          }
        }
      } catch (error) {
        // If quiz check fails, assume quiz is not completed
        router.push("/matching-quiz");
      }
    } catch (error: any) {
      setErr("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-white overflow-x-hidden relative">
      {/* Background Animation */}
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
      <div id="particles" className="fixed inset-0 pointer-events-none z-[-1]" />

      {/* Login Container */}
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(162,99,204,0.3)] rounded-[30px] p-10 w-full max-w-[600px] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[slideUp_0.6s_ease-out]">
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[rgba(162,99,204,0.8)] to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />

          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="text-[3rem] mb-4">🎓</div>
            <div className="text-[2rem] font-extrabold bg-gradient-to-r from-white to-[#d4adfc] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(162,99,204,0.3)]">Pingin</div>
          </div>

          {/* Form Header */}
          <p className="text-[#d4adfc] text-[0.875rem] mb-2 text-center uppercase tracking-[1.5px] font-semibold">Student Portal</p>
          <h1 className="text-[2rem] font-bold text-white mb-8 text-center leading-tight">Welcome Back</h1>

          {/* Message Container */}
          {(err || success) && (
            <div className={`p-4 rounded-xl mb-6 text-center text-[0.9rem] ${
              err ? 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5]' : 
              'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#86efac]'
            }`}>
              {err || success}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="text-[rgba(255,255,255,0.8)] text-[0.9rem] font-medium mb-2 block" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-[15px] text-base bg-[rgba(255,255,255,0.05)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.5)] focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:shadow-[0_0_0_4px_rgba(212,173,252,0.1)]"
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="mb-5">
              <label className="text-[rgba(255,255,255,0.8)] text-[0.9rem] font-medium mb-2 block" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-[rgba(162,99,204,0.3)] rounded-[15px] text-base bg-[rgba(255,255,255,0.05)] text-white transition-all duration-300 outline-none placeholder-[rgba(255,255,255,0.5)] focus:border-[#d4adfc] focus:bg-[rgba(255,255,255,0.1)] focus:shadow-[0_0_0_4px_rgba(212,173,252,0.1)]"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="text-right mb-6">
              <a href="#" className="text-[#d4adfc] text-[0.875rem] font-medium transition-all duration-300 hover:text-white hover:underline">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-[#7209b7] to-[#a663cc] text-white border-none rounded-[15px] text-base font-semibold uppercase tracking-[1px] cursor-pointer transition-all duration-300 mb-6 shadow-[0_10px_30px_rgba(114,9,183,0.3)] hover:translate-y-[-3px] hover:shadow-[0_15px_40px_rgba(114,9,183,0.5)] active:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(212,173,252,0.3)] to-transparent" />
            <span className="px-4 py-2 text-[rgba(255,255,255,0.7)] text-[0.875rem] font-medium bg-[rgba(255,255,255,0.05)] rounded-[20px] border border-[rgba(212,173,252,0.2)] backdrop-blur-[10px]">
              OR
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(212,173,252,0.3)] to-transparent" />
          </div>

          {/* Google Sign In */}
          <button className="w-full p-4 bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(212,173,252,0.3)] rounded-[15px] text-base font-medium cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 mb-6 text-white backdrop-blur-[10px] hover:border-[rgba(212,173,252,0.5)] hover:bg-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] hover:shadow-[0_8px_25px_rgba(114,9,183,0.2)]">
            <div className="w-5 h-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjY0IDkuMjM2OUMxNy42NCA4LjU5NjkgMTcuNTgyNyA3Ljk1MjkgMTcuNDY5MSA3LjMyOTNIMTBWMTAuODk1M0gxNC4zODU1QzE0LjIxOTEgMTEuNzUgMTMuNzU5MSAxMi41NDE0IDEzLjA5IDEzLjEwNTVWMTUuMjMxOEgxNS40MzE4QzE2LjcwOTEgMTQuMTEzNiAxNy42NCA2LjU0NTQgMTcuNjQgOS4yMzY5VjkuMjM2OVoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTkuOTk5OTggMTcuNDU0NkMxMi42NzI3IDE3LjQ1NDYgMTQuOTI3MyAxNi42MTM2IDE2LjQzMTggMTUuMjMxOEwxMy4wOTk5IDEzLjEwNTVDMTIuMzA5MSAxMy42MjczIDExLjMxMzYgMTMuOTEzNiA5Ljk5OTk4IDEzLjkxMzZDNy4xOTU0NCAxMy45MTM2IDUuNzA0NTMgMTIuMDE4MSA0Ljk2MzYyIDkuNjEzNjNIMi41ODE4VjExLjczMTdDNC4yNjM2MyAxNC44ODYzIDYuOTQ5OTggMTcuNDU0NiA5Ljk5OTk4IDE3LjQ1NDZaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik00Ljk2MzYxIDkuNjEzNjRDNC43NDU0NCA4LjcyNzI3IDQuNzQ1NDQgNy4yNzI3MyA0Ljk2MzYxIDYuMzg2MzZWNC4yNjgxOEgyLjU4MTgxQzEuNjEzNjMgNi4wNDU0NSAxLjYxMzYzIDguOTU0NTUgMi41ODE4MSA5LjczMTgyTDQuOTYzNjEgOS42MTM2NFoiIGZpbGw9IiNGQkJDMDUiLz4KPHBhdGggZD0iTTEwLjAwMDEgNi4wODY0QzExLjE4NjQgNi4wODY0IDEyLjI4MjkgNi41MDkxIDEzLjEzNjQgNy4zNTAzN0wxNS4yMzY0IDUuMjUwMzdDMTMuNTI3MyAzLjY1OTEgMTEuNDQxIDIuNzI3MyAxMC4wMDAxIDIuNzI3M0M2Ljk1MDEgMi43MjczIDQuMjYzNzMgNS4yOTU0NSAyLjU4MTgxIDguNDQ5OThMNC45NjM2MSA5LjYxMzYxQzUuNzA0NTMgNy4yMDkwOSA3LjE5NTQ1IDYuMDg2NCA5Ljk5OTk5IDYuMDg2NFoiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+Cg==')] bg-center bg-contain bg-no-repeat" />
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-[rgba(255,255,255,0.7)] text-[0.875rem]">
            Don't have an account? <a href="/signup" className="text-[#d4adfc] font-semibold transition-all duration-300 hover:text-white hover:underline">Sign up for free</a>
          </p>
        </div>
      </div>

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
