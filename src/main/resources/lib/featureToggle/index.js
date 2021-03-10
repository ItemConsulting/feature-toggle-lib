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

exports.isEnabled = function(featureKey, defaultRespose = false) {
  const connection = node.connect()
  const key = getKey()
  const feature = connection.get(`/${key}/${featureKey}`)
  if(feature) {
    return feature.data.enabled
  }

  return defaultRespose
}