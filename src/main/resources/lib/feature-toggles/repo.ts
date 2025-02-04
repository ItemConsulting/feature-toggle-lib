import { create as createRepo, createBranch, get as getRepo, type Permission } from "/lib/xp/repo";
import { includes } from "/lib/feature-toggles/utils";
import { REPO_NAME } from "/lib/feature-toggles/constants";

const PERMISSIONS_READ: Permission[] = ["READ", "READ_PERMISSIONS"];
const PERMISSIONS_WRITE: Permission[] = ["CREATE", "MODIFY", "DELETE", "PUBLISH", "WRITE_PERMISSIONS"];

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
          principal: "role:feature-toggles.admin",
          allow: PERMISSIONS_READ.concat(PERMISSIONS_WRITE),
        },
        {
          principal: "role:feature-toggles.viewer",
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
}
