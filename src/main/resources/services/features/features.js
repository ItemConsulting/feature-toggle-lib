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
  if (!req.data.space || !req.data.branch || !req.data.feature || typeof req.data.enabled === undefined) {
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
}