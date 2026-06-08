import { MistakeTypesEditor } from "@/components/admin/MistakeTypesEditor";

export default function AdminMistakeTypesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Mistake Types</h1>
      <p className="mt-2 text-muted">
        Manage mistake categories and subcategory chips shown in live sessions.
        Deactivated types stay on historical records but hide in the UI.
      </p>
      <div className="mt-6 max-w-3xl">
        <MistakeTypesEditor />
      </div>
    </div>
  );
}
