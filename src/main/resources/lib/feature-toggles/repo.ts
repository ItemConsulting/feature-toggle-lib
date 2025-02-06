import { create as createRepo, createBranch, get as getRepo, type Permission } from "/lib/xp/repo";
import { includes } from "/lib/feature-toggles/utils";
import { createRole, getPrincipal, type RoleKey } from "/lib/xp/auth";
import { REPO_NAME } from "/lib/feature-toggles/constants";

const PERMISSIONS_READ: Permission[] = ["READ", "READ_PERMISSIONS"];
const PERMISSIONS_WRITE: Permission[] = ["CREATE", "MODIFY", "DELETE", "PUBLISH", "WRITE_PERMISSIONS"];

export const PRINCIPAL_KEY_ADMIN = `role:${REPO_NAME}.admin` satisfies RoleKey;
export const PRINCIPAL_KEY_VIEWER = `role:${REPO_NAME}.viewer` satisfies RoleKey;

export function initRepo(): void {
  const repo =
    getRepo(REPO_NAME) ??
    createRepo({
      id: REPO_NAME,
      rootPermissions: [
        {
          principal: "role:system.admin",
          allow: PERMISSIONS_READ.concat(PERMISSIONS_WRITE),
        },
        {
          principal: PRINCIPAL_KEY_ADMIN,
          allow: PERMISSIONS_READ.concat(PERMISSIONS_WRITE),
        },
        {
          principal: PRINCIPAL_KEY_VIEWER,
          allow: PERMISSIONS_READ,
          deny: PERMISSIONS_WRITE,
        },
        {
          principal: "role:system.everyone",
          allow: PERMISSIONS_READ,
          deny: PERMISSIONS_WRITE,
        },
        {
          principal: "user:system:anonymous",
          allow: PERMISSIONS_READ,
          deny: PERMISSIONS_WRITE,
        },
      ],
    });

  // create missing branches
  ["master", "draft"]
    .filter((branchId) => !includes(repo.branches, branchId))
    .forEach((branchId) =>
      createBranch({
        branchId,
        repoId: REPO_NAME,
      }),
    );

  if (getPrincipal(PRINCIPAL_KEY_ADMIN) === null) {
    createRole({
      displayName: "Feature Toggles Admin",
      name: PRINCIPAL_KEY_ADMIN.split(":")[1],
    });

    log.info(`Created new principal: "${PRINCIPAL_KEY_ADMIN}"`);
  }

  if (getPrincipal(PRINCIPAL_KEY_VIEWER) === null) {
    createRole({
      displayName: "Feature Toggles Viewer",
      name: PRINCIPAL_KEY_VIEWER.split(":")[1],
    });

    log.info(`Created new principal: "${PRINCIPAL_KEY_VIEWER}"`);
  }
}
