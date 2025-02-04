import { get as getContext } from "/lib/xp/context";
import { connect, getChildren, type FeatureNode } from "./node";
import { forceArray } from "./utils";
export { initRepo, PRINCIPAL_KEY_ADMIN, PRINCIPAL_KEY_VIEWER } from "./repo";
import type { Node } from "/lib/xp/node";

export type FeatureNodePath = `/${string}/${string}`;
export type FeatureNodeKey = {
  spaceKey: string;
  featureKey: string;
};

export type FeatureConfig = {
  name: string;
  enabled: boolean;
  description?: string;
  value?: unknown;
};

export type Feature = FeatureConfig & {
  id: string;
  createdDate: string;
};

export type IsEnabledParams = {
  featureKey: string;
  spaceKey?: string;
  defaultValue?: boolean;
  branch?: "draft" | "master";
};

export function isEnabled(featureKey: string): boolean;
export function isEnabled(params: IsEnabledParams): boolean;
export function isEnabled(params: string | IsEnabledParams): boolean;
export function isEnabled(params: string | IsEnabledParams): boolean {
  const contextBranch = getContext().branch;
  const spaceKey = typeof params === "string" ? app.name : (params.spaceKey ?? app.name);
  const featureKey = typeof params === "string" ? params : params.featureKey;
  const defaultValue = typeof params === "string" ? false : (params.defaultValue ?? false);
  const branch = typeof params === "string" ? contextBranch : (params.branch ?? contextBranch);

  try {
    const feature = connect().get<FeatureNode>(getFeatureNodePath({ featureKey, spaceKey }));

    if (feature) {
      return feature.data.enabled ?? defaultValue;
    } else if (branch === "draft") {
      // If on draft, create the feature if it doesn't exist
      create(
        {
          name: featureKey,
          enabled: defaultValue,
        },
        spaceKey,
      );
    }
  } catch (e) {
    log.error(`Can't check feature toggle state for "${spaceKey}/${featureKey}"`, e);
  }

  return defaultValue;
}

export function create(features: FeatureConfig[] | FeatureConfig, spaceKey: string = app.name): void {
  const connection = connect({
    branch: "draft",
  });

  const spaceNode = connection.exists(`/${spaceKey}`);

  if (!spaceNode) {
    connection.create({
      _name: spaceKey,
      _parentPath: "/",
      _inheritsPermissions: true,
    });

    log.info(`Created new space ${spaceKey}`);
  }

  forceArray(features)
    .filter((feature) => !connection.exists(`/${spaceKey}/${feature.name}`))
    .forEach((feature) => {
      connection.create({
        _name: feature.name,
        _parentPath: `/${spaceKey}`,
        _inheritsPermissions: true,
        data: {
          enabled: Boolean(feature.enabled),
          value: feature.value,
          description: feature.description,
        },
      });

      log.info(`Created feature "${feature.name}" in space "${spaceKey}"`);
    });
}

export function update(feature: Omit<Feature, "name" | "createdDate">): Feature;
export function update(feature: Omit<Feature, "id" | "createdDate">, spaceKey?: string): Feature;
export function update(
  feature: Omit<Feature, "name" | "createdDate"> | Omit<Feature, "id" | "createdDate">,
  spaceKey: string = app.name,
): Feature {
  const connection = connect({
    branch: "draft",
  });

  const key =
    "id" in feature
      ? feature.id
      : getFeatureNodePath({
          spaceKey: spaceKey,
          featureKey: feature.name,
        });

  const res = connection.modify<FeatureNode>({
    key,
    editor: (repoNode) => {
      repoNode.data = {
        ...repoNode.data,
        enabled: feature.enabled,
        value: feature.value,
        description: feature.description,
      };

      return repoNode;
    },
  });

  return nodeToFeature(res);
}

export function publish(idOrKey: string | FeatureNodeKey): boolean {
  const connection = connect({
    branch: "draft",
  });

  const res = connection.push({
    key: typeof idOrKey === "string" ? idOrKey : getFeatureNodePath(idOrKey),
    target: "master",
  });

  res.failed.forEach((failed) => log.error(`Failed to publish feature ${failed.id} to master: ${failed.reason}`));

  return res.failed.length === 0;
}

export function getSpaces(): Node[] {
  return getChildren({ parentKey: "/" });
}

export function getFeature(params: FeatureNodeKey | string, branch: string = "draft"): Feature | undefined {
  const key = typeof params === "string" ? params : getFeatureNodePath(params);
  const node = connect({ branch }).get<FeatureNode>(key);
  return node ? nodeToFeature(node) : undefined;
}

export function getFeatures(spaceKey: string = app.name, branch: string = "draft"): Feature[] {
  try {
    return getChildren<FeatureNode>({ parentKey: `/${spaceKey}` }, branch).map(nodeToFeature);
  } catch (e) {
    log.error(`Failed to get features for space ${spaceKey} in branch ${branch}`, e);
    return [];
  }
}

export function getFeatureNodePath({ spaceKey, featureKey }: FeatureNodeKey): FeatureNodePath {
  return `/${spaceKey}/${featureKey}`;
}

function nodeToFeature(node: Node<FeatureNode>): Feature {
  return {
    id: node._id,
    name: node._name,
    enabled: Boolean(node.data.enabled),
    value: node.data.value,
    description: node.data.description,
    createdDate: node._ts,
  };
}
