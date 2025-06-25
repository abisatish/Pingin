import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");
  const r = useRouter();

  async function handle(e: any) {
    console.log("HANDLE METGHOD CALLED");
    e.preventDefault();
    console.log("After prevent default CALLED");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log(data)
      localStorage.setItem("token", data.access_token);
      r.push("/dashboard");
    } catch {
      setErr("Bad credentials");
    }
  }

  return (
    <main className="grid place-items-center h-screen">
      <form onSubmit={handle} className="shadow p-8 w-80 rounded space-y-4">
        <h1 className="text-xl font-bold text-center">Login</h1>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          className="border p-2 w-full"
        />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Sign in
        </button>
      </form>
    </main>
  );
}
