import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtected = createRouteMatcher(["/app(.*)"]);
const isPublicHealth = createRouteMatcher(["/api/health"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

function shouldBypassAuth(req: NextRequest) {
  if (isPublicHealth(req)) return true;
  if (process.env.AGENTLEDGER_DEMO_MODE === "true") return true;
  if (!clerkConfigured) return true;
  return false;
}

export default function middleware(req: Parameters<typeof clerk>[0], event: Parameters<typeof clerk>[1]) {
  if (shouldBypassAuth(req)) {
    return NextResponse.next();
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
