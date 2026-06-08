"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { MistakeCategoryTreeDto } from "@/lib/queries/mistake-taxonomy";

export function MistakeTypesEditor() {
  const [categories, setCategories] = useState<MistakeCategoryTreeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addSubFor, setAddSubFor] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState({
    slug: "",
    labelEn: "",
  });
  const [newSub, setNewSub] = useState({
    slug: "",
    labelEn: "",
  });

  function load() {
    return fetch("/api/admin/mistake-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAddCategory(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/mistake-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create category");
      return;
    }
    setShowAddCategory(false);
    setNewCategory({ slug: "", labelEn: "" });
    await load();
  }

  async function handleAddSubcategory(
    event: FormEvent,
    categoryId: string,
  ) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/mistake-subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, ...newSub }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create subcategory");
      return;
    }
    setAddSubFor(null);
    setNewSub({ slug: "", labelEn: "" });
    await load();
  }

  async function patchCategory(
    id: string,
    patch: { labelEn?: string; isActive?: boolean; sortOrder?: number },
  ) {
    setSavingId(id);
    const res = await fetch(`/api/admin/mistake-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    if (res.ok) await load();
    else {
      const data = await res.json();
      setError(data.error ?? "Update failed");
    }
  }

  async function patchSubcategory(
    id: string,
    patch: { labelEn?: string; isActive?: boolean; sortOrder?: number },
  ) {
    setSavingId(id);
    const res = await fetch(`/api/admin/mistake-subcategories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    if (res.ok) await load();
    else {
      const data = await res.json();
      setError(data.error ?? "Update failed");
    }
  }

  if (loading) return <p className="text-muted">Loading mistake types…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddCategory(true)}>
          Add category
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showAddCategory && (
        <Card>
          <form onSubmit={handleAddCategory} className="space-y-3">
            <input
              required
              placeholder="slug (e.g. pronunciation)"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={newCategory.slug}
              onChange={(e) =>
                setNewCategory({ ...newCategory, slug: e.target.value })
              }
            />
            <input
              required
              placeholder="Label"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={newCategory.labelEn}
              onChange={(e) =>
                setNewCategory({ ...newCategory, labelEn: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setShowAddCategory(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {categories.map((category) => (
        <Card key={category.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium"
              value={category.labelEn}
              disabled={savingId === category.id}
              onChange={(e) =>
                setCategories((rows) =>
                  rows.map((c) =>
                    c.id === category.id
                      ? { ...c, labelEn: e.target.value }
                      : c,
                  ),
                )
              }
              onBlur={() =>
                patchCategory(category.id, { labelEn: category.labelEn })
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={category.isActive}
                disabled={savingId === category.id}
                onChange={(e) =>
                  patchCategory(category.id, { isActive: e.target.checked })
                }
              />
              Active
            </label>
            <span className="font-mono text-xs text-muted">{category.slug}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${
                  sub.isActive
                    ? "border-border bg-stone-50"
                    : "border-stone-200 bg-stone-100 opacity-60"
                }`}
              >
                <input
                  className="w-24 border-0 bg-transparent text-sm outline-none"
                  value={sub.labelEn}
                  disabled={savingId === sub.id}
                  onChange={(e) =>
                    setCategories((rows) =>
                      rows.map((c) =>
                        c.id === category.id
                          ? {
                              ...c,
                              subcategories: c.subcategories.map((s) =>
                                s.id === sub.id
                                  ? { ...s, labelEn: e.target.value }
                                  : s,
                              ),
                            }
                          : c,
                      ),
                    )
                  }
                  onBlur={() =>
                    patchSubcategory(sub.id, { labelEn: sub.labelEn })
                  }
                />
                <button
                  type="button"
                  className="text-xs text-muted hover:text-foreground"
                  title={sub.isActive ? "Deactivate" : "Activate"}
                  onClick={() =>
                    patchSubcategory(sub.id, { isActive: !sub.isActive })
                  }
                >
                  {sub.isActive ? "×" : "↺"}
                </button>
              </div>
            ))}
            {addSubFor === category.id ? (
              <form
                onSubmit={(e) => handleAddSubcategory(e, category.id)}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  required
                  placeholder="slug"
                  className="w-28 rounded-lg border border-border px-2 py-1 text-sm"
                  value={newSub.slug}
                  onChange={(e) =>
                    setNewSub({ ...newSub, slug: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Label"
                  className="w-32 rounded-lg border border-border px-2 py-1 text-sm"
                  value={newSub.labelEn}
                  onChange={(e) =>
                    setNewSub({ ...newSub, labelEn: e.target.value })
                  }
                />
                <Button type="submit" size="sm">
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddSubFor(null)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <button
                type="button"
                className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
                onClick={() => setAddSubFor(category.id)}
              >
                + Add chip
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
