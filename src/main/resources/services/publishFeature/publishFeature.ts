import { publishFeature } from "/lib/featureToggle";

export function post(req) {
  const data = JSON.parse(req.body);
  if (!data.space || !data.feature) {
    return {
      body: {
        message: "Missing parameter",
      },
      status: 400,
      contentType: "application/json",
    };
  }

  const success = publishFeature({
    space: data.space,
    feature: data.feature,
  });

  return {
    body: {
      success,
    },
    contentType: "application/json",
  };
}
