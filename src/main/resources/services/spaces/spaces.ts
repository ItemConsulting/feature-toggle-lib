import { getSpaces } from "/lib/featureToggle";

export function get() {
  return {
    body: {
      spaces: getSpaces(),
    },
    contentType: "application/json",
  };
}
