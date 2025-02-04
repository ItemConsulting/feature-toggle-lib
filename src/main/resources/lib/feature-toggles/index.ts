import { get as getContext } from "/lib/xp/context";
import { connect, getChildren, type Node, type FeatureNode } from "./node";
import { forceArray, type Optional } from "./utils";
export { initRepo } from "./repo";

export type FeatureNodePath = `/${string}/${string}`;
export type FeatureNodeKey = {
  spaceKey: string;
  featureKey: string;
};
export type Feature = {
  id: string;
  name: string;
  enabled: boolean;
  value?: unknown;
};
export type FeatureWithOptionalId = Optional<Feature, "id">;
export type IsEnabledParams = {
  featureKey: string;
  spaceKey?: string;
  defaultValue?: boolean;
};

export function isEnabled(featureKey: string): boolean;
export function isEnabled(params: IsEnabledParams): boolean;
export function isEnabled(params: string | IsEnabledParams): boolean;
export function isEnabled(params: string | IsEnabledParams): boolean {
  const spaceKey = typeof params === "string" ? app.name : (params.spaceKey ?? app.name);
  const featureKey = typeof params === "string" ? params : params.featureKey;
  const defaultValue = typeof params === "string" ? false : (params.defaultValue ?? false);

  try {
    const feature = connect().get<FeatureNode>(getFeatureNodePath({ featureKey, spaceKey }));

    if (feature) {
      return feature.data.enabled ?? defaultValue;
    } else if (getContext().branch === "draft") {
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

export function create(features: FeatureWithOptionalId[] | FeatureWithOptionalId, spaceKey: string = app.name): void {
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
    .filter((feature) => connection.exists(`/${spaceKey}/${feature.name}`))
    .forEach((feature) => {
      connection.create({
        _name: feature.name,
        _parentPath: `/${spaceKey}`,
        _inheritsPermissions: true,
        data: {
          enabled: Boolean(feature.enabled),
          value: feature.value,
        },
      });

      log.info(`Created feature "${feature.name}" in space "${spaceKey}"`);
    });
}

export function update(feature: FeatureWithOptionalId, spaceKey: string = app.name): Feature {
  const connection = connect({
    branch: "draft",
  });

  const key = getFeatureNodePath({
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
      };

      return repoNode;
    },
  });

  return nodeToFeature(res);
}

export function publishFeature(featureKey: string, spaceKey: string = app.name): boolean {
  const connection = connect({
    branch: "draft",
  });

  const res = connection.push({
    key: getFeatureNodePath({
      featureKey,
      spaceKey,
    }),
    target: "master",
  });

  res.failed.forEach((failed) => log.error(`Failed to publish feature ${failed.id} to master: ${failed.reason}`));

  return res.failed.length === 0;
}

export function getSpaces(): Node[] {
  return getChildren({ parentKey: "/" });
}

export function getFeatures(spaceKey: string = app.name, branch: string = "draft"): Feature[] {
  return getChildren<FeatureNode>({ parentKey: `/${spaceKey}` }, branch).map(nodeToFeature);
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
  };
}
