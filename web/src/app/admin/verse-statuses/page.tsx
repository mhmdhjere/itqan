import { VerseStatusesEditor } from "@/components/admin/VerseStatusesEditor";

export default function AdminVerseStatusesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Verse Statuses</h1>
      <p className="mt-2 text-muted">
        Edit scoring weights, labels, and colors for verse statuses.
      </p>
      <div className="mt-6 max-w-2xl">
        <VerseStatusesEditor />
      </div>
    </div>
  );
}
