import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function Dashboard() {
  const { data } = useSWR("/dashboard", fetcher);

  if (!data) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard ({data.role})</h1>

      <section>
        <h2 className="font-semibold">Recent Pings</h2>
        <ul className="space-y-2">
          {data.pings.map((p: any) => (
            <li key={p.id} className="border p-2 rounded">
              <p className="font-medium">{p.question}</p>
              <p className="text-sm text-gray-500">Status: {p.status}</p>
              <Link href={`/review/${p.id}`} className="text-blue-500 underline">
                View Document
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {data.role === "student" && (
        <section>
          <h2 className="font-semibold">Your College Applications</h2>
          <ul className="space-y-2">
            {data.applications.map((a: any) => (
              <li key={a.college_id}>
                <Link href={`/college/${a.college_id}`} className="text-blue-500 underline">
                  {a.college}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.role === "consultant" && (
        <section>
          <h2 className="font-semibold">Your Students</h2>
          <ul className="space-y-2">
            {data.students.map((s: any) => (
              <li key={s.id} className="border p-2 rounded">
                <p>{s.registration_id}</p>
                <p>GPA: {s.gpa}</p>
                {s.photo_url && <img src={s.photo_url} alt="Student photo" className="w-20" />}
                <Link href={`/student/${s.id}`} className="text-blue-500 underline">
                  View Profile
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
