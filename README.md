# Feature Toggle Lib

Library for interacting with the [Feature Toggle App](https://github.com/ItemConsulting/feature-toggle-app) to use
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
  include "no.item:lib-xp-feature-toggle:0.4.0"
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
+     "/lib/featureToggle": ["../../../node_modules/@item-enonic-types/lib-feature-toggles"],
    }
  }
}
```

## Compatibility

| Version | XP Version |                                                                                        Repository |                         App Version                          |
|---------|:----------:|--------------------------------------------------------------------------------------------------:|:------------------------------------------------------------:|
| 0.4.0   | >= 7.12.0  |               [Itemtest](https://repo.itemtest.no/#/releases/no/item/lib-xp-feature-toggle/0.0.4) | [0.1.0](https://github.com/ItemConsulting/xp-feature-toggle) 
| 0.3.0   |  >= 7.0.0  | [Maven Central](https://central.sonatype.com/artifact/com.gravitondigital/featuretogglelib/0.3.0) | [0.1.0](https://github.com/ItemConsulting/xp-feature-toggle) 
| 0.2.0   |  >= 7.0.0  | [Maven Central](https://central.sonatype.com/artifact/com.gravitondigital/featuretogglelib/0.2.0) | [0.1.0](https://github.com/ItemConsulting/xp-feature-toggle) 
| 0.1.0   |  >= 7.0.0  | [Maven Central](https://central.sonatype.com/artifact/com.gravitondigital/featuretogglelib/0.1.0) | [0.1.0](https://github.com/ItemConsulting/xp-feature-toggle)

## Usage

### `isEnabled`

Checks if the feature is enabled for the current space. Where the space is the site you're running in, or the name of 
the app if it's not running in the context of a site.

`isEnabled` will automatically create the space and the feature with a default value if it's called in a `draft` context.

```typescript
import { isEnabled } from '/lib/featureToggle';

// returns true or false
const isMyFeatureEnabled = isEnabled('my-feature');

// optional second param that is the default value of the feature, defaults to false if not passed
const mySecondFeature = isEnabled('my-second-feature', true);

// optional third param to override automatic space
const myThirdFeature = isEnabled('my-third-feature', undefined | true | false , 'override-space');
```

### `create`

Creates spaces and features for your app. This should usually be run from your main.js file, to initalize spaces and 
features you're going use. Spaces and features will automatically be created by the `isEnabled` function, but if you're 
using the companion app for this library, they won't show up there until someone hits that part of your code.

This will only create the spaces and features for `draft` contexts, and not `master`,  you'll have to use the companion 
app or `publishFeature` for that.

This will not update features that already exists, for that you'll have to use `update`.

```typescript
import { create } from '/lib/featureToggle';

// single
create({
  space: 'my-site-or-application-name',
  features: [
    {
      feature: 'my-feature',
      enabled: true|false
    }
  ]
});

// multiple
create([
  {
    space: 'my-site-or-application-name',
    features: [
      {
        feature: 'my-feature',
        enabled: true|false
      },
      {
        feature: 'my-second-feature',
        enabled: true|false
      }
    ]
  },
  {
    space: 'my-second-site-or-application-name',
    features: [
      {
        feature: 'my-other-feature',
        enabled: true|false
      }
    ]
  }
]);
```

### `update`

Enable/Disable a feature in draft

```typescript
import { update } from '/lib/featureToggle';

update({
  space: 'my-site-or-application-name',
  feature: 'my-feature',
  enabled: true|false
});
```

### `publishFeature`

Publishes feature from draft to master

```typescript
import { publishFeature } from '/lib/featureToggle';

publishFeature({
  space: 'my-site-or-application-name',
  feature: 'my-feature'
});
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
