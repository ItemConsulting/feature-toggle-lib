import { getSite } from "/lib/xp/portal";
import { get as getContext } from "/lib/xp/context";
import { connect } from "./node";
import { forceArray, runAsAdmin } from "./utils";

export type Space = {
  _id: string;
  _name: string;
};

export type Feature = {
  _id: string;
  _name: string;
  enabled: boolean;
};

export type FeatureNode = {
  data: FeatureCreate;
};

export type FeatureCreate = {
  feature: string;
  enabled: boolean;
};

export type SpaceCreate = {
  space: string;
  features: FeatureCreate[];
};

export type PublishFeatureParams = {
  space: string;
  feature: string;
};

type UpdateParams = {
  space: string;
  feature: string;
  enabled: boolean;
};

export function isEnabled(featureKey: string, defaultValue = false, space?: string): boolean {
  try {
    const context = getContext();
    const connection = connect();

    if (!space) {
      space = getKey();
    }

    const feature = connection.get<FeatureNode>(`/${space}/${featureKey}`);
    if (feature) {
      return feature.data.enabled;
    }

    if (context.branch === "draft") {
      create({
        space: space,
        features: [
          {
            feature: featureKey,
            enabled: defaultValue,
          },
        ],
      });
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Create features
 */
export function create(options: SpaceCreate[] | SpaceCreate): void {
  runAsAdmin(() => {
    const connection = connect("draft");
    forceArray(options).forEach((spaceOptions) => {
      const spaceNode = connection.get(`/${spaceOptions.space}`);

      if (!spaceNode) {
        connection.create({
          _name: spaceOptions.space,
          _parentPath: "/",
          _inheritsPermissions: true,
        });
      }

      spaceOptions.features.forEach((featuresOptions) => {
        const featureNode = connection.get(`/${spaceOptions.space}/${featuresOptions.feature}`);
        if (!featureNode) {
          connection.create({
            _name: featuresOptions.feature,
            _parentPath: `/${spaceOptions.space}`,
            _inheritsPermissions: true,
            data: {
              enabled: !!featuresOptions.enabled,
            },
          });
        }
      });
    });
  });
}

/**
 * Update features
 * @throws {Error}
 */
export function update(options: UpdateParams): Feature {
  if (options) {
    return runAsAdmin(() => {
      const connection = connect("draft");
      const repoSpace = connection.get(`/${options.space}`);
      if (!repoSpace) {
        throw new Error(`no space ${options.space}`);
      }

      const repoFeature = connection.get(`/${options.space}/${options.feature}`);

      if (!repoFeature) {
        throw new Error(`no feature ${options.feature} in space ${options.space}`);
      }

      const modifiedNode = connection.modify<FeatureNode>({
        key: repoFeature._id,
        editor: (repoNode) => {
          repoNode.data.enabled = options.enabled;
          return repoNode;
        },
      });

      return {
        _id: modifiedNode._id,
        _name: modifiedNode._name,
        enabled: modifiedNode.data.enabled,
      };
    });
  }
}

/**
 * Publish a feature
 */
export function publishFeature(options: PublishFeatureParams): boolean {
  if (options) {
    return runAsAdmin(() => {
      const connection = connect("draft");
      const repoSpace = connection.get(`/${options.space}`);
      if (!repoSpace) {
        throw new Error(`no space ${options.space}`);
      }
      const repoFeature = connection.get(`/${options.space}/${options.feature}`);
      if (!repoFeature) {
        throw new Error(`no feature ${options.feature} in space ${options.space}`);
      }

      const res = connection.push({
        key: repoFeature._id,
        target: "master",
      });

      return res.failed.length === 0;
    });
  }

  return false;
}

export function getSpaces(): Space[] {
  const connection = connect("draft");
  const spaces = connection.findChildren({
    parentKey: "/",
    start: 0,
    count: 100,
  }).hits;

  return spaces.map((space) => {
    const repoSpace = connection.get(space.id);
    return {
      _id: repoSpace._id,
      _name: repoSpace._name,
    };
  });
}

export function getFeatures(space: string, branch: string): Feature[] {
  const connection = connect(branch);
  const features = connection.findChildren({
    parentKey: `/${space}`,
    start: 0,
    count: -1,
  }).hits;

  return features.map((feature) => {
    const repoFeature = connection.get<FeatureNode>(feature.id);

    return {
      _id: repoFeature._id,
      _name: repoFeature._name,
      enabled: !!repoFeature.data.enabled,
    };
  });
}

function getKey(): string {
  try {
    const site = getSite();

    if (site) {
      return site._name;
    }
  } catch {}

  return app.name;
}
