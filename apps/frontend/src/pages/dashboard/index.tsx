import useSWR from "swr";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function Dashboard() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const { data } = useSWR("/dashboard", fetcher);

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

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard ({data.role})</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

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
