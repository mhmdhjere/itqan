import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export const unauthorized = () => jsonError("Unauthorized", 401);
export const forbidden = () => jsonError("Forbidden", 403);
export const notFound = () => jsonError("Not found", 404);
export const badRequest = (message: string) => jsonError(message, 400);
