import { FeatureFlagsEditor } from "@/components/admin/FeatureFlagsEditor";

export default function FeatureFlagsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Feature Flags</h1>
      <p className="mt-2 text-muted">
        Enable or disable teacher-facing features without a deploy.
      </p>
      <FeatureFlagsEditor />
    </div>
  );
}
