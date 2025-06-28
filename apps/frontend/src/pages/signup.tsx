import { useState } from "react";
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

  async function handle(e: any) {
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
    <main className="min-h-screen w-full flex items-center justify-center bg-green-400 bg-gradient-to-br from-green-400 to-green-600">
      <form
        onSubmit={handle}
        className="bg-white rounded-xl shadow-lg px-10 py-8 flex flex-col items-center w-full max-w-sm"
      >
        <div className="mb-6">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 6C24 6 12 18 12 28C12 36 24 42 24 42C24 42 36 36 36 28C36 18 24 6 24 6Z" fill="#388E3C"/>
            <path d="M24 13C24 13 16 22 16 29C16 34 24 38 24 38C24 38 32 34 32 29C32 22 24 13 24 13Z" fill="#66BB6A"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
        
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-3"
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-3"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-3"
          required
        />
        
        <input
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-4"
          required
        />
        
        {err && <p className="text-sm text-red-500 mb-4 w-full text-center">{err}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 hover:bg-green-800 disabled:bg-green-500 text-white w-full py-2 rounded-md font-semibold text-lg transition-colors mb-4"
        >
          {loading ? "Creating Account..." : "SIGN UP"}
        </button>
        
        <div className="w-full text-center">
          <span className="text-gray-500 text-sm">Already have an account? </span>
          <a href="/login" className="text-green-700 text-sm font-medium hover:underline">Log in here</a>
        </div>
      </form>
    </main>
  );
} 