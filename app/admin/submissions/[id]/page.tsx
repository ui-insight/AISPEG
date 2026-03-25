"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Tier 1: Simple Static App", color: "bg-green-100 text-green-700 border-green-200" },
  2: { label: "Tier 2: Standard Web App", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  3: { label: "Tier 3: Managed Service App", color: "bg-orange-100 text-orange-700 border-orange-200" },
  4: { label: "Tier 4: Enterprise / Regulated", color: "bg-red-100 text-red-700 border-red-200" },
};

const statusOptions = ["new", "reviewed", "in-progress", "archived"];

interface Submission {
  id: string;
  idea_text: string;
  answers: Record<string, unknown>;
  score: number;
  tier: number;
  submitter_name: string | null;
  submitter_email: string | null;
  department: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sensitivity: string[] | null;
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[] | null;
  data_sources: string[] | null;
  university_systems: string[] | null;
  output_types: string[] | null;
}

interface Note {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm text-ui-charcoal">{value || "—"}</span>
    </div>
  );
}

function TagList({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) return <span className="text-sm text-gray-400">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [subRes, notesRes] = await Promise.all([
          fetch(`/api/submissions/${id}`),
          fetch(`/api/submissions/${id}/notes`),
        ]);

        if (!subRes.ok) {
          setError("Submission not found");
          return;
        }

        setSubmission(await subRes.json());
        if (notesRes.ok) {
          setNotes(await notesRes.json());
        }
      } catch {
        setError("Failed to load submission");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSubmission((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteAuthor.trim() || !noteContent.trim()) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: noteAuthor.trim(), content: noteContent.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setNoteContent("");
      }
    } finally {
      setNoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="space-y-4">
        <Link href="/admin/submissions" className="text-sm text-gray-500 hover:text-ui-charcoal">
          &larr; Back to submissions
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Submission not found"}
        </div>
      </div>
    );
  }

  const t = tierLabels[submission.tier] || tierLabels[1];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/submissions" className="text-sm text-gray-500 hover:text-ui-charcoal">
            &larr; Back to submissions
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ui-charcoal">Submission Detail</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">{submission.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${t.color}`}>
            {t.label}
          </span>
        </div>
      </div>

      {/* Status & Meta */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Status & Info</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={submission.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <DetailRow label="Score" value={<span className="font-mono font-semibold">{submission.score} pts</span>} />
          <DetailRow label="Submitter" value={submission.submitter_name} />
          <DetailRow label="Email" value={submission.submitter_email} />
          <DetailRow label="Department" value={submission.department} />
          <DetailRow
            label="Submitted"
            value={new Date(submission.created_at).toLocaleString()}
          />
        </div>

        {/* Idea */}
        <div className="rounded-xl border-l-4 border-ui-gold bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Project Idea</h2>
          <p className="mt-3 text-sm text-ui-charcoal whitespace-pre-wrap">
            {submission.idea_text || "(no description provided)"}
          </p>
        </div>
      </div>

      {/* Quiz Answers */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quiz Answers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailRow label="Sensitivity" value={<TagList items={submission.sensitivity} />} />
          <DetailRow label="Complexity" value={submission.complexity} />
          <DetailRow label="User Base" value={submission.userbase} />
          <DetailRow label="Auth Level" value={submission.auth_level} />
          <DetailRow label="Integrations" value={<TagList items={submission.integrations} />} />
          <DetailRow label="Data Sources" value={<TagList items={submission.data_sources} />} />
          <DetailRow label="University Systems" value={<TagList items={submission.university_systems} />} />
          <DetailRow label="Output Types" value={<TagList items={submission.output_types} />} />
        </div>
      </div>

      {/* Raw Answers (collapsible) */}
      <details className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Raw JSON Answers
        </summary>
        <pre className="overflow-x-auto border-t border-gray-200 px-5 py-4 text-xs text-gray-600">
          {JSON.stringify(submission.answers, null, 2)}
        </pre>
      </details>

      {/* Notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Notes ({notes.length})
        </h2>

        <form onSubmit={handleAddNote} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={noteAuthor}
              onChange={(e) => setNoteAuthor(e.target.value)}
              placeholder="Your name"
              className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            />
            <input
              type="text"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            />
            <button
              type="submit"
              disabled={noteSubmitting || !noteAuthor.trim() || !noteContent.trim()}
              className="rounded-lg bg-ui-gold px-4 py-2 text-sm font-medium text-ui-black hover:bg-ui-gold-light disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ui-charcoal">{note.author}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
