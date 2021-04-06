const node = require('/lib/featureToggle/node');
const portalLib = require('/lib/xp/portal');
const contextLib = require('/lib/xp/context');

function getSite() {
  try {
    const site = portalLib.getSite();
    return site;
  } catch (e) {}
  return null;
}

function getKey() {
  const site = getSite();
  if (site) {
    return site._name;
  }
  return app.name;
}

exports.isEnabled = function (featureKey, defaultValue = false) {
  try {
    const context = contextLib.get();
    const connection = node.connect();
    const space = getKey();
    const feature = connection.get(`/${space}/${featureKey}`);
    if (feature) {
      return feature.data.enabled;
    }

    if (context.branch === 'draft') {
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
  } catch (e) {
    return defaultValue;
  }
};

/**
 * @typedef {{feature: string, enabled: boolean}} FeatureCreate
 */

/**
 * @typedef {{space: string, features: Array<FeatureCreate>}} SpaceCreate
 */

/**
 * @description Create features
 * @param {Array<SpaceCreate> | SpaceCreate} options
 */
function create(options) {
  if (options) {
    if (!Array.isArray(options)) {
      options = [options];
    }
    node.runAsAdmin(() => {
      const connection = node.connect('draft');
      options.forEach((/**@type {SpaceCreate} */ spaceOptions) => {
        const spaceNode = connection.get(`/${spaceOptions.space}`);
        if (!spaceNode) {
          connection.create({
            _name: spaceOptions.space,
            _parentPath: '/',
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
}

exports.create = create;

/**
 * @description update features
 * @param {{space: string, feature: string, enabled: boolean}} options
 */
function update(options) {
  if (options) {
    return node.runAsAdmin(() => {
      const connection = node.connect('draft');
      const repoSpace = connection.get(`/${options.space}`);
      if (!repoSpace) {
        throw new Error(`no space ${options.space}`);
      }
      const repoFeature = connection.get(`/${options.space}/${options.feature}`);
      if (!repoFeature) {
        throw new Error(`no feature ${options.feature} in space ${options.space}`);
      }
      const modifiedNode = connection.modify({
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

exports.update = update;

/**
 * @description update features
 * @param {{space: string, feature: string}} options
 */
function publishFeature(options) {
  if (options) {
    return node.runAsAdmin(() => {
      const connection = node.connect('draft');
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
        target: 'master',
      });
      return res.failed.length === 0;
    });
  }
  return false;
}

exports.publishFeature = publishFeature;

function getSpaces() {
  const connection = node.connect('draft');
  const spaces = connection.findChildren({
    parentKey: '/',
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

exports.getSpaces = getSpaces;

function getFeatures(space, branch) {
  const connection = node.connect(branch);
  const features = connection.findChildren({
    parentKey: `/${space}`,
    start: 0,
    count: 1000,
  }).hits;
  return features.map((feature) => {
    const repoFeature = connection.get(feature.id);
    return {
      _id: repoFeature._id,
      _name: repoFeature._name,
      enabled: !!repoFeature.data.enabled,
    };
  });
}

exports.getFeatures = getFeatures;
