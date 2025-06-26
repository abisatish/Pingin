import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function CollegeProfile() {
  const { query } = useRouter();
  const { data } = useSWR(
    query.collegeId ? `/college/${query.collegeId}` : null,
    fetcher
  );

  if (!data) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">{data.college.name}</h1>
      <h2 className="text-xl">Application status: {data.application.status}</h2>

      <h3 className="mt-4 font-bold">Pings</h3>
      <ul className="space-y-2">
        {data.pings.map((p:any) => (
          <li key={p.id} className="border p-2 rounded">
            <p>Q: {p.question}</p>
            <p>A: {p.answer || "No answer yet"}</p>
            <p>Status: {p.status}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
