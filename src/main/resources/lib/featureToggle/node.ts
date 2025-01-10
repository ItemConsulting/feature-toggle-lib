import { connect as xpConnect, type RepoConnection } from "/lib/xp/node";
import { get as getRepo, create as createRepo, createBranch as createBranch } from "/lib/xp/repo";
import { get as getContext } from "/lib/xp/context";
import {
  FEATURE_TOGGLE_DRAFT,
  FEATURE_TOGGLE_MASTER,
  FEATURE_TOGGLE_REPO,
  PERMISSIONS,
} from "/lib/featureToggle/constants";

export function connect(branch?: string): RepoConnection {
  const context = getContext();

  if (context.branch === FEATURE_TOGGLE_DRAFT) {
    try {
      let repo = getRepo(FEATURE_TOGGLE_REPO);

      if (!repo) {
        repo = createRepo({
          id: FEATURE_TOGGLE_REPO,
          rootPermissions: PERMISSIONS,
        });
      }

      if (repo.branches.filter((b) => b === FEATURE_TOGGLE_MASTER).length === 0) {
        createBranch({
          branchId: FEATURE_TOGGLE_MASTER,
          repoId: FEATURE_TOGGLE_REPO,
        });
      }

      if (repo.branches.filter((b) => b === FEATURE_TOGGLE_DRAFT).length === 0) {
        createBranch({
          branchId: FEATURE_TOGGLE_DRAFT,
          repoId: FEATURE_TOGGLE_REPO,
        });
      }
    } catch {
      // try to connect anyway
    }
  }

  return xpConnect({
    repoId: FEATURE_TOGGLE_REPO,
    branch: branch ?? context.branch,
  });
}
