"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleFormModal } from "@/components/circles/CircleFormModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import type { CircleListItem } from "@/lib/queries/circles";

export function CirclesList({ circles }: { circles: CircleListItem[] }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Circles</h1>
          <p className="mt-1 text-sm text-muted">
            Select a circle to view your students
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New circle</Button>
      </div>

      {circles.length === 0 ? (
        <Card className="text-center">
          <p className="text-muted">No circles yet.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            Create your first circle
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {circles.map((circle) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <Card className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{circle.name}</h2>
                  {circle.description && (
                    <p className="mt-0.5 text-sm text-muted">
                      {circle.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>
                      {circle.studentCount}{" "}
                      {circle.studentCount === 1 ? "student" : "students"}
                    </Badge>
                    {circle.lastSessionAt && (
                      <span className="text-xs text-muted">
                        Last session {formatRelativeDate(circle.lastSessionAt)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-muted" aria-hidden>
                  →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CircleFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
