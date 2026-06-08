import { Card } from "@/components/ui/Card";
import { teacherName } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted">Teacher preferences (mock)</p>

      <Card className="mt-4">
        <h2 className="font-medium">Profile</h2>
        <p className="mt-2 text-sm">{teacherName}</p>
        <p className="text-sm text-muted">ahmad.teacher@itqan.app</p>
      </Card>

      <Card className="mt-4 space-y-3">
        <h2 className="font-medium">Display</h2>
        <label className="flex items-center justify-between text-sm">
          <span>Live session theme</span>
          <select className="rounded border border-border px-2 py-1" defaultValue="light">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Quran font size</span>
          <select className="rounded border border-border px-2 py-1" defaultValue="medium">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </Card>

      <p className="mt-6 text-xs text-muted">
        Platform configuration is managed in the Admin Panel (not included in this mock).
      </p>
    </div>
  );
}
