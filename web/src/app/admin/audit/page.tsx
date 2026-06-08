import { AuditLogViewer } from "@/components/admin/AuditLogViewer";

export default function AdminAuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <p className="mt-2 text-muted">
        Configuration and user changes with old → new values.
      </p>
      <div className="mt-6 max-w-4xl">
        <AuditLogViewer />
      </div>
    </div>
  );
}
