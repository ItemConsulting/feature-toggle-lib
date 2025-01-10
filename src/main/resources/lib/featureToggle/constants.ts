import type { AccessControlEntry } from "/lib/xp/repo";

export const FEATURE_TOGGLE_REPO = "com.gravitondigital.feature-toggle";
export const FEATURE_TOGGLE_MASTER = "master";
export const FEATURE_TOGGLE_DRAFT = "draft";

export const PERMISSIONS: AccessControlEntry[] = [
  {
    principal: "role:system.admin",
    allow: ["READ", "CREATE", "MODIFY", "DELETE", "PUBLISH", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
    deny: [],
  },
  {
    principal: "role:feature-toggle.admin",
    allow: ["READ", "CREATE", "MODIFY", "DELETE", "PUBLISH", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
    deny: [],
  },
  {
    principal: "role:feature.toggle.viewer",
    allow: ["READ"],
    deny: ["CREATE", "MODIFY", "DELETE", "PUBLISH", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
  },
  {
    principal: "role:system.everyone",
    allow: ["READ", "READ_PERMISSIONS"],
    deny: ["CREATE", "MODIFY", "DELETE", "PUBLISH", "WRITE_PERMISSIONS"],
  },
  {
    principal: "user:system:anonymous",
    allow: ["READ", "READ_PERMISSIONS"],
    deny: ["CREATE", "MODIFY", "DELETE", "PUBLISH", "WRITE_PERMISSIONS"],
  },
];
