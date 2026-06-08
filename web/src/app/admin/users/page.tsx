import { UsersEditor } from "@/components/admin/UsersEditor";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-muted">
        Invite teachers and admins. Suspended users cannot sign in.
      </p>
      <div className="mt-6 max-w-3xl">
        <UsersEditor />
      </div>
    </div>
  );
}
