"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type CircleFormModalProps = {
  open: boolean;
  onClose: () => void;
  circle?: { id: string; name: string; description: string | null };
};

export function CircleFormModal({ open, onClose, circle }: CircleFormModalProps) {
  const router = useRouter();
  const isEdit = !!circle;

  const [name, setName] = useState(circle?.name ?? "");
  const [description, setDescription] = useState(circle?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const url = isEdit ? `/api/circles/${circle.id}` : "/api/circles";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
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
        aria-labelledby="circle-form-title"
      >
        <h2 id="circle-form-title" className="text-lg font-semibold">
          {isEdit ? "Edit circle" : "New circle"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="circle-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="circle-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="circle-description"
              className="mb-1.5 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="circle-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {loading ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
