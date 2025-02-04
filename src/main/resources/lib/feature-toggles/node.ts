import {
  connect as nodeConnect,
  ConnectParams as XPConnectParams,
  FindChildrenParams,
  type Node,
  type RepoConnection,
} from "/lib/xp/node";
import { get as getContext } from "/lib/xp/context";
import { REPO_NAME } from "/lib/feature-toggles/constants";

export type { Node } from "/lib/xp/node";

export type FeatureNode = {
  type: "no.item.feature-toggles:feature";
  data: {
    enabled: boolean;
    value: unknown;
  };
};

export function getSpaceNode(spaceKey?: string): Node | null {
  const connection = connect({
    branch: "draft",
  });

  return connection.get(`/${spaceKey ?? app.name}`);
}

export function getChildren<NodeData = Record<string, unknown>>(
  params: FindChildrenParams,
  branch = "draft",
): Node<NodeData>[] {
  const connection = connect({ branch });

  return connection
    .findChildren({
      count: -1,
      ...params,
    })
    .hits.map((space) => connection.get<NodeData>(space.id))
    .filter((node) => node !== null);
}

export type ConnectParams = Partial<Omit<XPConnectParams, "repoId">>;

export function connect(params: ConnectParams = {}): RepoConnection {
  const context = getContext();

  return nodeConnect({
    ...params,
    repoId: REPO_NAME,
    branch: params.branch ?? context.branch ?? "draft",
  });
}
