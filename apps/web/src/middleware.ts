import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher(["/app(.*)"]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export default function middleware(req: Parameters<typeof clerk>[0], event: Parameters<typeof clerk>[1]) {
  if (process.env.AGENTLEDGER_DEMO_MODE === "true") {
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
