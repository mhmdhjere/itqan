"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type StudentFormModalProps = {
  open: boolean;
  onClose: () => void;
  circleId: string;
  student?: {
    id: string;
    fullName: string;
    contactInfo: string | null;
  };
};

export function StudentFormModal({
  open,
  onClose,
  circleId,
  student,
}: StudentFormModalProps) {
  const router = useRouter();
  const isEdit = !!student;

  const [fullName, setFullName] = useState(student?.fullName ?? "");
  const [contactInfo, setContactInfo] = useState(student?.contactInfo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const url = isEdit
      ? `/api/students/${student.id}`
      : `/api/circles/${circleId}/students`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName.trim(),
        contactInfo: contactInfo.trim() || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit student" : "Add student"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="student-name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="student-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="student-contact"
              className="mb-1.5 block text-sm font-medium"
            >
              Contact info
            </label>
            <input
              id="student-contact"
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Email or phone (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
