import { getFeatures, update } from "/lib/featureToggle";

export function get(req) {
  if (!req.params.space || !req.params.branch) {
    return {
      body: {
        message: "Missing parameter",
      },
      status: 400,
      contentType: "application/json",
    };
  }
  return {
    body: {
      features: getFeatures(req.params.space, req.params.branch),
    },
    contentType: "application/json",
  };
}

export function post(req) {
  const data = JSON.parse(req.body);
  if (!data.space || !data.feature || typeof data.enabled === undefined) {
    return {
      body: {
        message: "Missing parameter",
      },
      status: 400,
      contentType: "application/json",
    };
  }
  return {
    body: {
      feature: update({
        space: data.space,
        feature: data.feature,
        enabled: data.enabled,
      }),
    },
    contentType: "application/json",
  };
}
