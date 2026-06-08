import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | null = null;
let database: Db | null = null;

export function getDb(): Db {
  if (!database) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    client = postgres(connectionString, { max: 10 });
    database = drizzle(client, { schema });
  }
  return database;
}

/** @deprecated Prefer getDb() — kept for gradual migration */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
