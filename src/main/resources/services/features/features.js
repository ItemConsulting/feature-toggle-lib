const featureToggleLib = require('/lib/featureToggle');

exports.get = function (req) {
  if (!req.params.space || !req.params.branch) {
    return {
      body: {
        message: 'Missing parameter',
      },
      status: 400,
      contentType: 'application/json',
    };
  }
  return {
    body: {
      features: featureToggleLib.getFeatures(req.params.space, req.params.branch),
    },
    contentType: 'application/json',
  };
};

exports.post = function(req) {
  const data = JSON.parse(req.body)
  if (!data.space || !data.branch || !data.feature || typeof data.enabled === undefined) {
    return {
      body: {
        message: 'Missing parameter',
      },
      status: 400,
      contentType: 'application/json',
    };
  }
  return {
    body: {
      feature: featureToggleLib.update({
        space: data.space,
        feature: data.feature,
        enabled: data.enabled
      }),
    },
    contentType: 'application/json',
  };
}