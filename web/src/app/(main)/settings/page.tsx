import Link from "next/link";
import { auth } from "@/auth";
import { DisplayModeSettings } from "@/components/settings/DisplayModeSettings";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted">Teacher preferences</p>

      <DisplayModeSettings />

      <Card className="mt-4">
        <h2 className="font-medium">Profile</h2>
        <p className="mt-2 text-sm">{session?.user?.name ?? "Teacher"}</p>
        <p className="text-sm text-muted">{session?.user?.email}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-medium">Scoring & mastery</h2>
        <p className="mt-2 text-sm text-muted">
          See how verse scores and student mastery are calculated from the
          active platform configuration.
        </p>
        <Link
          href="/scoring"
          className="mt-3 inline-block text-sm text-accent hover:underline"
        >
          How scoring works →
        </Link>
      </Card>
    </div>
  );
}
