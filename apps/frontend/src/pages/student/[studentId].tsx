import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function StudentProfile() {
  const { query } = useRouter();
  const { data } = useSWR(
    query.studentId ? `/student/${query.studentId}` : null,
    fetcher
  );

  if (!data) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Student {data.student.id}</h1>
      <p>GPA: {data.transcripts[0]?.gpa ?? "N/A"}</p>
      <p>Paid: {data.student.paid ? "Yes" : "No"}</p>

      <h3 className="mt-4 font-bold">Applications</h3>
      <ul className="space-y-2">
        {data.applications.map((app:any) => (
          <li key={app.id} className="border p-2 rounded">
            <p>College ID: {app.college_id}</p>
            <p>Status: {app.status}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
