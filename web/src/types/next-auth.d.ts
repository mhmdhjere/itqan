import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "teacher" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "teacher" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "teacher" | "admin";
  }
}
