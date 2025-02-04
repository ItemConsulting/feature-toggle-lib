# Feature Toggles Lib

Library for interacting with the [Feature Toggles App](https://github.com/ItemConsulting/xp-feature-toggles) to use
feature toggles in Enonic XP.

[![](https://repo.itemtest.no/api/badge/latest/releases/no/item/lib-xp-feature-toggle)](https://repo.itemtest.no/#/releases/no/item/lib-xp-feature-toggle)

> [!TIP]
> We recommend that you use the "Feature Toggle" App to toggle feature flags instead of using this library to do it programmatically.

## Installation

To install this library you need to add a new dependency to your app's build.gradle file.

### Gradle

```groovy
repositories {
  maven { url "https://repo.itemtest.no/releases" }
}

dependencies {
  include "no.item:lib-xp-feature-toggles:1.0.0"
}
```

### TypeScript

Install the TypeScript-types with the following command:

```bash
npm install --save-dev @item-enonic-types/lib-features-toggles
```

By adding the following changes to your *tsconfig.json* you will get TypeScript-support for this library.

```diff
{
  "compilerOptions": {
    "paths": {
+     "/lib/feature-toggles": ["../../../node_modules/@item-enonic-types/lib-feature-toggles"],
    }
  }
}
```

## Usage

### `isEnabled`

Checks if the feature is enabled for the current space. Where the space by default is your apps name. You can also name
your own spaces if you want to configure it per site.

`isEnabled` will automatically create the space and the feature with a default value if it's called in a `draft` context.

```typescript
import { isEnabled } from "/lib/feature-toggles";

const isMyFeatureEnabled1: boolean = isEnabled({
  featureKey: "my-feature",
  defaultValue: false,
  spaceKey: app.name,
});

// This shorthand will yield the the same result as the example above
const isMyFeatureEnabled2: boolean = isEnabled("my-feature");
```

### `create`

Creates spaces and features for your app. This should usually be run from your main.js file, to initialize spaces and 
features you're going use. Spaces and features will automatically be created by the `isEnabled()` function, but if you're 
using the companion app for this library, they won't show up there until someone hits that part of your code.

This will only create the spaces and features for `"draft"` contexts, and not `"master"`,  you'll have to use the companion 
app or `publishFeature()` for that.

This will not update features that already exists, for that you'll have to use `update()`.

```typescript
import { create } from "/lib/feature-toggles";

// Create a single new feature flag
create({
  name: "my-feature",
  enabled: true,
});

// Create multiple new feature flags
create([
  {
    name: "my-feature",
    enabled: false,
  },
  {
    name: "my-second-feature",
    enabled: true,
  }
]);

// Create feature flags in a different "space"
const siteBasedSpaceKey = getSite()._name;

create(
  [
    {
      name: "my-feature",
      enabled: false,
    },
    {
      name: "my-second-feature",
      enabled: true,
    },
  ],
  siteBasedSpaceKey,
);
```

### `update`

Enable/Disable a feature in draft

```typescript
import { update } from "/lib/feature-toggles";

// Enable the feature "my-feature" in the application space
update({
  name: "my-feature",
  enabled: true
});

// Disable the feature "my-feature" in a space based on the current site
const siteBasedSpaceKey = getSite()._name;

update(
  {
    name: "my-feature",
    enabled: false,
  },
  siteBasedSpaceKey,
);
```

### `publishFeature`

Publishes feature from draft to master

```typescript
import { publishFeature } from "/lib/feature-toggles";

// Publish a feature to go live on your site
publishFeature("my-feature");

// Publish to a different space then `app.name`
const siteBasedSpaceKey = getSite()._name;

publishFeature("my-feature", siteBasedSpaceKey)

```

## Deploying

### Building

To build the project run the following code

```bash
./gradlew build
```

### Deploy locally

Deploy locally for testing purposes:

```bash
./gradlew publishToMavenLocal
```

## Deploy to Maven

```bash
./gradlew publish -P com.enonic.xp.app.production=true
```
