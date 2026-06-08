import { ScoringPreview } from "@/components/admin/ScoringPreview";

export default function AdminScoringPreviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Scoring Preview</h1>
      <p className="mt-2 text-muted">
        Simulate verse scores using the current mastery configuration.
      </p>
      <ScoringPreview />
    </div>
  );
}
