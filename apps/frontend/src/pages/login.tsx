import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");
  const r = useRouter();

  async function handle(e: any) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      r.push("/dashboard");
    } catch {
      setErr("Bad credentials");
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
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          className="border border-gray-200 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400 text-base mb-1"
        />
        <div className="w-full flex justify-end mb-2">
          <a href="#" className="text-green-700 text-sm hover:underline">Forgot password?</a>
        </div>
        {err && <p className="text-sm text-red-500 mb-2 w-full text-center">{err}</p>}
        <button
          className="bg-green-700 hover:bg-green-800 text-white w-full py-2 rounded-md font-semibold text-lg transition-colors mb-2 mt-1"
        >
          LOGIN
        </button>
        <div className="w-full text-center mt-2">
          <span className="text-gray-500 text-sm">Don't have an account? </span>
          <a href="#" className="text-green-700 text-sm font-medium hover:underline">Make one now!</a>
        </div>
      </form>
    </main>
  );
}
