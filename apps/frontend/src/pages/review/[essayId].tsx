// apps/frontend/src/pages/review/[essayId].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function Review() {
  const { query } = useRouter();
  const { data: essay, mutate } = useSWR(
    typeof window !== "undefined" && query.essayId
      ? `/review/${query.essayId}`
      : null,          // <-- null => don't fetch during SSR
    fetcher
  );

  /* ---------------- role ---------------- */
  const [role, setRole] = useState<"" | "student" | "consultant">("");

  useEffect(() => {
    // runs **only** in the browser
    const t = localStorage.getItem("token");
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split(".")[1]));
        setRole(payload.role);
      } catch (_) {
        setRole("");
      }
    }
  }, []);

  /* -------------- editing --------------- */
  const [draft, setDraft] = useState("");
  if (!essay) return null;

  const editable = role === "student";

  const save = async () => {
    await api.put(`/review/${essay.id}`, { response: draft });
    mutate();
  };

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-4">
      <h1 className="text-xl font-bold">{essay.prompt}</h1>

      {editable ? (
        <>
          <textarea
            defaultValue={essay.response}
            onChange={e => setDraft(e.target.value)}
            className="w-full h-64 border p-2"
          />
          <button
            onClick={save}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </>
      ) : (
        <p className="whitespace-pre-line border p-4 bg-gray-50">
          {essay.response}
        </p>
      )}
    </main>
  );
}
