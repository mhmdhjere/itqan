import { ConfigEditor } from "@/components/admin/ConfigEditor";

const CATEGORIES = ["mastery", "review", "live_session", "display", "system"];

export default function AdminConfigPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Configuration</h1>
      <p className="mt-2 text-muted">
        Edit platform settings. Changes are audit-logged and reflected in the
        teacher app within 60 seconds.
      </p>
      <div className="mt-6">
        <ConfigEditor categories={CATEGORIES} />
      </div>
    </div>
  );
}
