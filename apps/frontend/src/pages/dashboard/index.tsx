import useSWR from "swr";
import { api } from "@/lib/api";
import PingForm from "@/components/PingForm";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function Dashboard() {
  // demo student/application IDs
  const studentId = 1;
  const applicationId = 1;

  const { data: pings = [] } = useSWR("/pings", fetcher, { refreshInterval: 3000 });

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Pings</h1>

      <PingForm studentId={studentId} applicationId={applicationId} />

      <ul className="space-y-2 mt-6">
        {pings.map((p: any) => (
          <li key={p.id} className="border p-4 rounded">
            <span className="font-semibold">#{p.id}</span>{" "}
            <em className="text-sm text-slate-500">({p.status})</em>
            <p>{p.question}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
