import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            Itqan
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to your account</p>
        </div>

        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
