"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import useSWRMutation from "swr/mutation";

async function createPing(_: any, { arg }: { arg: any }) {
  const { data } = await api.post("/pings", arg);
  return data;
}

export default function PingForm({ applicationId, studentId }: { applicationId: number; studentId: number }) {
  const [question, setQuestion] = useState("");
  const { trigger } = useSWRMutation("/pings", createPing);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await trigger({ application_id: applicationId, student_id: studentId, question });
    setQuestion("");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your consultant…"
        className="border w-full p-2 rounded"
      />
      <button className="bg-blue-600 text-white px-4 py-1 rounded">Send Ping</button>
    </form>
  );
}
