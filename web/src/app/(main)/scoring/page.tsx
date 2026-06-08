import Link from "next/link";
import { getActiveConfig } from "@/lib/config/service";
import { Card } from "@/components/ui/Card";

export default async function ScoringGuidePage() {
  let config = null;
  try {
    config = await getActiveConfig();
  } catch {
    // use empty state
  }

  const mistakePenalty =
    (config?.config.mastery.mistake_penalty as number | undefined) ?? 5;
  const rollingWindow =
    (config?.config.mastery.rolling_window_sessions as number | undefined) ?? 3;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/settings" className="text-sm text-muted hover:text-foreground">
        ← Settings
      </Link>
      <h1 className="mt-2 text-xl font-semibold">How Scoring Works</h1>
      <p className="mt-1 text-sm text-muted">
        Read-only view of the active mastery rules from platform configuration.
      </p>

      <Card className="mt-6">
        <h2 className="font-semibold">Per-verse session score</h2>
        <p className="mt-1 text-sm text-muted">
          Each marked ayah receives a base score from its status. Unmarked ayahs
          are treated as correct ({config?.verseStatuses.find((s) => s.isDefaultImplicit)?.scorePoints ?? 100} pts).
          Each mistake tag deducts {mistakePenalty} points (minimum 0).
        </p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {config?.verseStatuses.map((s) => (
              <tr key={s.slug} className="border-b border-border/60">
                <td className="py-2">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.labelEn}
                  {s.isDefaultImplicit && (
                    <span className="ml-1 text-xs text-muted">(default)</span>
                  )}
                </td>
                <td className="py-2 font-medium">{s.scorePoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Session mastery</h2>
        <p className="mt-2 text-sm text-muted">
          Session mastery is the simple average of all verse scores in that
          session (marked and implicit correct).
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Student mastery %</h2>
        <p className="mt-2 text-sm text-muted">
          For each ayah, the last {rollingWindow} recitations are averaged with
          decay weighting (most recent counts more). Student mastery is the
          average across all recited ayahs.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Mistake categories</h2>
        <div className="mt-3 space-y-3">
          {config?.mistakeCategories.map((cat) => (
            <div key={cat.slug}>
              <p className="text-sm font-medium">{cat.labelEn}</p>
              <p className="text-xs text-muted">
                {config.mistakeSubcategories
                  .filter((s) => s.categorySlug === cat.slug)
                  .map((s) => s.labelEn)
                  .join(", ")}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
