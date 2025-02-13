# Feature Toggles Lib

Library for creating _Feature Toggles_, and checking if they have been enabled/disabled by the 
[Feature Toggles App](https://github.com/ItemConsulting/xp-feature-toggles). A _feature toggle_ is is a boolean flag
that can be used in your application to enable/disable functionality.

[![](https://repo.itemtest.no/api/badge/latest/releases/no/item/lib-xp-feature-toggles)](https://repo.itemtest.no/#/releases/no/item/lib-xp-feature-toggles)

![Icon](docs/icon.svg)

Common usages of feature toggles are:
- Merging partially implemented features into your codebase, but not exposing them to the end users
- A feature switch (kill switch?) that can be used by the admins/editors
- Enable a feature on the `"draft"` branch, but not on `"master"`.

> [!TIP]
> We recommend that you use the _Feature Toggle App_ to toggle feature flags instead of using this library to do it programmatically.

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

### `isEnabled()`

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

### `create()`

Creates spaces and features for your app. This should usually be run from your main.js file, to initialize spaces and 
features you're going use. Spaces and features will automatically be created by the `isEnabled()` function, but if you're 
using the companion app for this library, they won't show up there until someone hits that part of your code.

This will only create the spaces and features for `"draft"` contexts, and not `"master"`,  you'll have to use the companion 
app or `publishFeature()` for that.

This will not update features that already exists, for that you'll have to use `update()`.

```typescript
import { create } from "/lib/feature-toggles";

// Create a single new feature flag in the default space (`app.name`)
create({
  name: "my-feature",
  enabled: true,
});

// Create multiple new feature flags in the default space (`app.name`)
create([
  {
    name: "my-feature",
    enabled: false,
  },
  {
    name: "my-second-feature",
    enabled: true,
  },
]);

// Create feature flags in a different "space"
const siteBasedSpaceKey = getSite()._name;

create(
  [
    {
      name: "my-feature",
      enabled: false,
      spaceKey: siteBasedSpaceKey,
    },
    {
      name: "my-second-feature",
      enabled: true,
      spaceKey: siteBasedSpaceKey,
    },
  ],
);
```

### `update()`

Enable/Disable a feature in draft

```typescript
import { update } from "/lib/feature-toggles";

// Enable the feature "my-feature" in the default space (`app.name`)
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
    spaceKey: siteBasedSpaceKey,
  },
);
```

### `publish()`

Publishes feature from `"draft"` to `"master"`.

```typescript
import { publish } from "/lib/feature-toggles";

// Publish a feature with a given `id` to go live on your site
publish("9800b7a6-ebe6-4332-ac24-c70cd7ecf596");

// Publish a feature in the default space to go live
publish({
  featureKey: "my-feature",
  spaceKey: app.name,
})

// Publish to a different space then `app.name`
const siteBasedSpaceKey = getSite()._name;

publish({
  featureKey: "my-feature",
  spaceKey: siteBasedSpaceKey
})

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
