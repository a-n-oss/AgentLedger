import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "./db";

export const SURFACE_COOKIE = "al_surface";

export type ConsoleSurface = "app" | "demo";

export async function getConsoleSurface(): Promise<ConsoleSurface> {
  const value = (await cookies()).get(SURFACE_COOKIE)?.value;
  if (value === "demo" && isDemoMode()) return "demo";
  return "app";
}

export async function getConsoleBasePath() {
  return (await getConsoleSurface()) === "demo" ? "/demo" : "/app";
}

/** Revalidate console paths under both /app and /demo (rewritten). */
export function revalidateConsole(suffix: string) {
  const path = suffix.startsWith("/") ? suffix : `/${suffix}`;
  revalidatePath(`/app${path === "/" ? "" : path}`);
  if (isDemoMode()) {
    revalidatePath(`/demo${path === "/" ? "" : path}`);
  }
}
