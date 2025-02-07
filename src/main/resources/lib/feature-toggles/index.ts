import { get as getContext } from "/lib/xp/context";
import { connect, getChildren, query, type FeatureNode, type SpaceNode } from "./node";
import { forceArray, notNullOrUndefined, unique, type Optional } from "./utils";
export { initRepo, PRINCIPAL_KEY_ADMIN, PRINCIPAL_KEY_VIEWER } from "./repo";
import { log as writeToAuditLog } from "/lib/xp/auditlog";
import { REPO_NAME } from "./constants";
import { Instant } from "/lib/time";
import type { Node } from "/lib/xp/node";

type Branch = "draft" | "master";

export type FeatureNodePath = `/${string}/${string}`;
export type FeatureNodeKey = {
  featureKey: string;
  spaceKey?: string;
};

export type Feature = {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  spaceKey: string;
  value?: unknown;
  createdTime: string;
};

export type IsEnabledParams = {
  featureKey: string;
  spaceKey?: string;
  defaultValue?: boolean;
  branch?: Branch;
};

/**
 * Returns true if the specified feature is enabled, or the default value if not found.
 */
export function isEnabled(featureKey: string): boolean;
export function isEnabled(params: IsEnabledParams): boolean;
export function isEnabled(params: string): boolean;
export function isEnabled(params: string | IsEnabledParams): boolean {
  const contextBranch = getContext().branch;
  const spaceKey = typeof params === "string" ? app.name : (params.spaceKey ?? app.name);
  const featureKey = typeof params === "string" ? params : params.featureKey;
  const defaultValue = typeof params === "string" ? false : (params.defaultValue ?? false);
  const branch = typeof params === "string" ? contextBranch : (params.branch ?? contextBranch);

  try {
    const feature = connect({
      branch,
    }).get<FeatureNode>(getFeatureNodePath({ featureKey, spaceKey }));

    if (feature) {
      return feature.data.enabled ?? defaultValue;
    } else if (branch === "draft") {
      // If on draft, create the feature if it doesn't exist
      create({
        name: featureKey,
        enabled: defaultValue,
        spaceKey,
      });
    }
  } catch (e) {
    log.error(`Can't check feature toggle state for "${spaceKey}/${featureKey}"`, e);
  }

  return defaultValue;
}

type CreateFeatureParams = Omit<Optional<Feature, "spaceKey">, "id" | "createdTime">;

/**
 * Create one or multiple new Features
 */
export function create(features: CreateFeatureParams[] | CreateFeatureParams): void {
  const connection = connect({
    branch: "draft",
  });

  const spaceKeys = unique(forceArray(features).map((feature) => feature.spaceKey ?? app.name));

  spaceKeys
    .filter((spaceKey) => !connection.exists(`/${spaceKey}`))
    .forEach((spaceKey) => {
      connection.create<SpaceNode>({
        _name: spaceKey,
        _parentPath: "/",
        _inheritsPermissions: true,
        _childOrder: "_name ASC",
        type: "no.item.feature-toggles:space",
        createdTime: Instant.now().toString(),
      });

      log.info(`Created new space "${spaceKey}"`);
    });

  // Create features
  forceArray(features)
    .filter((feature) => !connection.exists(`/${feature.spaceKey ?? app.name}/${feature.name}`))
    .forEach((feature) => {
      connection.create<FeatureNode>({
        _name: feature.name,
        _parentPath: `/${feature.spaceKey ?? app.name}`,
        _inheritsPermissions: true,
        type: "no.item.feature-toggles:feature",
        createdTime: Instant.now().toString(),
        data: {
          enabled: Boolean(feature.enabled),
          value: feature.value,
          description: feature.description,
          spaceKey: feature.spaceKey ?? app.name,
        },
      });

      log.info(`Created feature "${feature.name}" in space "${feature.spaceKey ?? app.name}"`);
    });
}

type UpdateByIdParams = Omit<Optional<Feature, "spaceKey">, "name" | "createdTime">;
type UpdateByFeatureNameParams = Omit<Optional<Feature, "spaceKey">, "id" | "createdTime">;

/**
 * Update an existing Feature by ID or by Feature Name
 */
export function update(feature: UpdateByIdParams): Feature;
export function update(feature: UpdateByFeatureNameParams): Feature;
export function update(feature: UpdateByIdParams | UpdateByFeatureNameParams): Feature {
  const connection = connect({
    branch: "draft",
  });

  const key =
    "id" in feature
      ? feature.id
      : getFeatureNodePath({
          spaceKey: feature.spaceKey ?? app.name,
          featureKey: feature.name,
        });

  const res = connection.modify<FeatureNode>({
    key,
    editor: (repoNode) => {
      repoNode.data = {
        ...repoNode.data,
        enabled: feature.enabled ?? repoNode.data.enabled,
        value: feature.value ?? repoNode.data.value,
        description: feature.description ?? repoNode.data.description,
      };

      return repoNode;
    },
  });

  connection.refresh("ALL");

  return nodeToFeature(res);
}

/**
 * Publish changes to the master branch, and expose to "live" view
 */
export function publish(idOrKey: string | FeatureNodeKey): boolean {
  const connection = connect({
    branch: "draft",
  });

  const res = connection.push({
    key: typeof idOrKey === "string" ? idOrKey : getFeatureNodePath(idOrKey),
    target: "master",
    resolve: false, // prevent always publishing parent node too
  });

  connection.refresh("ALL");

  if (res.success.length > 0) {
    writeToAuditLog({
      type: "no.item.feature-toggles.publish",
      objects: [`${REPO_NAME}:${idOrKey}`],
      data: {
        params: {
          idOrKey,
        },
        result: {
          pushedContents: res.success,
        },
      },
    });
  }

  res.failed.forEach((failed) =>
    log.error(`Failed to publish node with id "${failed.id}" to master: ${failed.reason}`),
  );

  return res.failed.length === 0;
}

export function remove(idOrKey: string | FeatureNodeKey): boolean {
  const key = typeof idOrKey === "string" ? idOrKey : getFeatureNodePath(idOrKey);

  try {
    connect({ branch: "draft" }).delete(key);
    connect({ branch: "master" }).delete(key);

    log.info(`Removed feature with key="${key}"`);

    return true;
  } catch (e) {
    log.error(`Failed to remove feature with key="${key}"`, e);
    return false;
  }
}
/**
 * Returns the nodes representing all spaces
 */
export function getSpaces(): Node<SpaceNode>[] {
  return getChildren<SpaceNode>({ parentKey: "/" });
}

/**
 * Returns a single Feature by `id` or `featureKey` + `spaceKey`.
 */
export function getFeature(params: FeatureNodeKey | string, branch?: Branch): Feature | undefined {
  const key = typeof params === "string" ? params : getFeatureNodePath(params);
  const node = connect({ branch }).get<FeatureNode>(key);
  return node ? nodeToFeature(node) : undefined;
}

/**
 * Returns a list of features. If no `spaceKey` is provided it returns all features in all spaces.
 *
 * @param spaceKey Limit the results to the specified space.
 * @param branch Which branch to retrieve features from.
 */
export function getFeatures(spaceKey?: string | string[], branch?: Branch): Feature[] {
  try {
    return query<FeatureNode>(
      {
        filters: [
          {
            exists: {
              field: "data.enabled",
            },
          },
          {
            hasValue: {
              field: "data.spaceKey",
              values: forceArray(spaceKey).filter(notNullOrUndefined),
            },
          },
        ],
      },
      branch,
    ).map(nodeToFeature);
  } catch (e) {
    log.error(spaceKey ? `Failed to get features for space ${spaceKey}` : "Failed to list all features", e);
    return [];
  }
}

/**
 * Create the path of a node based on the provided `spaceKey` and `featureKey`.
 */
export function getFeatureNodePath({ spaceKey, featureKey }: FeatureNodeKey): FeatureNodePath {
  return `/${spaceKey ?? app.name}/${featureKey}`;
}

function nodeToFeature(node: Node<FeatureNode>): Feature {
  return {
    id: node._id,
    name: node._name,
    enabled: Boolean(node.data.enabled),
    value: node.data.value,
    spaceKey: node.data.spaceKey,
    description: node.data.description,
    createdTime: node.createdTime,
  };
}
