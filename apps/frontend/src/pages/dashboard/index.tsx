import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [pings, setPings] = useState([]);

  // Fetch all pings on page load
  useEffect(() => {
    api.get("/pings").then(res => setPings(res.data));
  }, []);

  // 🔧 Test ping submission function
  const submit = async () => {
    const student_id = 1;
    const college = "MIT";
    const question = "Can you review my essay?";

    await api.post("/pings", { student_id, college, question });

    // Refresh the ping list
    const response = await api.get("/pings");
    setPings(response.data);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Pings</h1>

      {/* 🔘 Test submit button */}
      <button
        onClick={submit}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Create Test Ping
      </button>

      <ul className="space-y-2">
        {pings.map((p: any) => (
          <li key={p.id} className="border p-4 rounded">
            <strong>{p.college}</strong> — {p.question}
          </li>
        ))}
      </ul>
    </main>
  );
}
