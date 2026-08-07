"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import {
  CHOOSE_ORGANIZATION_TASK_PATH,
  navigateAfterAuth,
} from "@/lib/auth-navigation";

/**
 * Sends users with an active session to /app, and pending choose-organization
 * sessions to the org task page (custom sign-in does not handle session tasks).
 */
export function RedirectIfAuthenticated() {
  const { isLoaded, isSignedIn, orgId } = useAuth();
  const { session } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    const taskKey = session?.currentTask?.key;
    if (taskKey === "choose-organization") {
      navigateAfterAuth(CHOOSE_ORGANIZATION_TASK_PATH);
      return;
    }

    // Active session (or signed-in without a pending org task) → console.
    if (isSignedIn || orgId || session?.status === "active") {
      navigateAfterAuth("/app");
    }
  }, [isLoaded, isSignedIn, orgId, session?.currentTask?.key, session?.status]);

  return null;
}
