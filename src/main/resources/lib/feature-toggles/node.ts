import {
  connect as nodeConnect,
  ConnectParams as XPConnectParams,
  FindChildrenParams,
  type Node,
  type QueryNodeParams,
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
    description?: string;
    spaceKey: string;
  };
};

export type SpaceNode = {
  type: "no.item.feature-toggles:space";
};

export function getChildren<NodeData = Record<string, unknown>>(
  params: FindChildrenParams,
  branch?: string,
): Node<NodeData>[] {
  const connection = connect({ branch });

  return connection
    .findChildren({
      childOrder: "_name ASC",
      count: -1,
      ...params,
    })
    .hits.map((space) => connection.get<NodeData>(space.id))
    .filter((node) => node !== null);
}

export function query<NodeData = Record<string, unknown>>(params: QueryNodeParams, branch?: string): Node<NodeData>[] {
  const connection = connect({ branch });

  return connection
    .query({
      count: -1,
      sort: "_name ASC",
      ...params,
    })
    .hits.map((space) => connection.get<NodeData>(space.id))
    .filter((node) => node !== null);
}

export type ConnectParams = Partial<Omit<XPConnectParams, "repoId">>;

export function connect(params: ConnectParams = {}): RepoConnection {
  return nodeConnect({
    ...params,
    repoId: REPO_NAME,
    branch: params.branch ?? getContext().branch ?? "draft",
  });
}
