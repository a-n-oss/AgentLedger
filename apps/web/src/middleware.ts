import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isAppRoute = createRouteMatcher(["/app(.*)"]);
const isDemoRoute = createRouteMatcher(["/demo(.*)"]);
const isPublicHealth = createRouteMatcher(["/api/health"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const demoEnabled = process.env.AGENTLEDGER_DEMO_MODE === "true";
const SURFACE_COOKIE = "al_surface";

function setSurface(res: NextResponse, surface: "app" | "demo") {
  res.cookies.set(SURFACE_COOKIE, surface, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

function handleDemoOrPublic(req: NextRequest) {
  if (isPublicHealth(req)) {
    return NextResponse.next();
  }

  if (isDemoRoute(req)) {
    if (!demoEnabled) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return setSurface(NextResponse.next(), "demo");
  }

  if (isAppRoute(req)) {
    if (!clerkConfigured) {
      if (demoEnabled) {
        return NextResponse.redirect(new URL("/demo", req.url));
      }
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return null;
}

const clerk = clerkMiddleware(async (auth, req) => {
  const early = handleDemoOrPublic(req);
  if (early) return early;

  if (isAppRoute(req)) {
    await auth.protect();
    return setSurface(NextResponse.next(), "app");
  }
});

export default function middleware(
  req: Parameters<typeof clerk>[0],
  event: Parameters<typeof clerk>[1],
) {
  if (!clerkConfigured) {
    return handleDemoOrPublic(req) ?? NextResponse.next();
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
