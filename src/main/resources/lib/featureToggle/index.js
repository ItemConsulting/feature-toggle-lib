const node = require('/lib/featureToggle/node')
const portalLib = require('/lib/xp/portal')

function getSite() {
  try {
    const site = portalLib.getSite()
    return site
  } catch(e) {
  }
  return null
}

function getKey() {
  const site = getSite()
  if(site) {
    return site._name
  }
  return app.name
}

exports.isEnabled = function(featureKey, defaultValue = false) {
  const connection = node.connect()
  const space = getKey()
  const feature = connection.get(`/${space}/${featureKey}`)
  if(feature) {
    return feature.data.enabled
  }

  create({
    key: featureKey,
    space: space,
    value: defaultValue
  })

  return defaultValue
}

/**
 * @description Create features
 * @param {Array<{space: string, key: string, value: boolean}> | {space: string, key: string, value: boolean}} options 
 */
function create(options) {
  if(options) {
    if(!Array.isArray(options)) {
      options = [options]
    }
    node.runAsAdmin(() => {
      const connection = node.connect()
      options.forEach((feature) => {
        const repoSpace = connection.get(`/${feature.space}`)
        if(!repoSpace) {
          connection.create({
            _name: feature.space,
            _parentPath: '/'
          })
        }
        const repoFeature = connection.get(`/${feature.space}/${feature.key}`)
        if(!repoFeature) {
          connection.create({
            _name: feature.key,
            _parentPath: `/${feature.space}`,
            data: {
              enabled: !!feature.value
            }
          })
        }
      })
    })
  }
}

exports.create = create

function getSpaces() {
  const connection = node.connect()
  const spaces = connection.findChildren({
    parentKey: '/',
    start: 0,
    count: 100
  }).hits
  return spaces.map((space) => {
    return connection.get(space.id)
  })
}

exports.getSpaces = getSpaces

function getFeatures(space) {
  const connection = node.connect()
  const features = connection.findChildren({
    parentKey: `/${space}`,
    start: 0,
    count: 1000
  }).hits
  return features.map((feature) => {
    const repoFeature = connection.get(feature.id)
    return {
      _id: repoFeature._id,
      _name: repoFeature._name,
      enabled: !!repoFeature.data.enabled
    }
  })
}

exports.getFeatures = getFeatures