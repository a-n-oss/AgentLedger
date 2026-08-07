/** Hard navigation so Clerk session cookies are visible to the next document request. */
export function navigateAfterAuth(path = "/app") {
  window.location.assign(path);
}

export const CHOOSE_ORGANIZATION_TASK_PATH = "/session-tasks/choose-organization";
