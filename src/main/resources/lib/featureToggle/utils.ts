import { run as runInContext } from "/lib/xp/context";
import { FEATURE_TOGGLE_DRAFT, FEATURE_TOGGLE_REPO } from "./constants";

export function runAsAdmin<T>(callback: () => T, branch = FEATURE_TOGGLE_DRAFT): T {
  return runInContext(
    {
      repository: FEATURE_TOGGLE_REPO,
      branch: branch,
      user: {
        login: "su",
        idProvider: "system",
      },
      principals: ["role:system.admin"],
    },
    callback,
  );
}

export function forceArray<A>(data: A | A[] | undefined | null): A[] {
  data = data ?? [];
  return Array.isArray(data) ? data : [data];
}
