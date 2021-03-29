# Feature Toggle Lib
It's higly recommended to install the companion application, [Feature Toggle App](https://github.com/GravitonDigital/feature-toggle-app), in your Enonic XP instance to manage your features, instead of doing everything programmatically
## Compatibility

| Version       | XP Version            | Download  | App Version |
| ------------- |:-------------:| -----:| :-----:|
| 0.1.0         | >= 7.0.0      | [Download](https://repo1.maven.org/maven2/com/gravitondigital/featuretogglelib/0.1.0/featuretogglelib-0.1.0.jar)     | [0.1.0](https://repo1.maven.org/maven2/com/gravitondigital/featuretoggleapp/0.1.0/featuretoggleapp-0.1.0.jar)

## Add to your project

Add this to your list of repositories in `build.gradle`
```groovy
maven {
    url "https://repo1.maven.org/maven2/"
}
```

And this dependency
```groovy
include "com.gravitondigital:featuretogglelib:0.1.0"
```

## Functions
```javascript
const featureToggleLib = require('/lib/featureToggle)
```
### isEnabled
Checks if the feature is enabled for the current space. Where the space is the site you're running in, or the name of the app if it's not running in the context of a site

`isEnabled` will automatically create the space and the feature with a default value if it's called in a `draft` context

```javascript
// returns true or false
const isMyFeatureEnabled = isEnabled('my-feature')
// optional second param that is the default value of the feature, defaults to false if not passed
const mySecondFeature = isEnabled('my-second-feature', true)
```


### create
Creates spaces and features for your app. This should usually be run from your main.js file, to initalize spaces and features you're going use. Spaces and features will automatically be created by the `isEnabled` function, but if you're using the companion app for this library, they won't show up there until someone hits that part of your code.

This will only create the spaces and features for `draft` contexts, and not `master`,  you'll have to use the companion app or `publishFeature` for that

This will not update features that already exists, for that you'll have to use `update`

```javascript
// one
create({
  space: 'my-site-or-application-name',
  key: 'my-feature',
  enabled: true|false
})
// multiple
create([
  {
    space: 'my-site-or-application-name',
    key: 'my-feature',
    enabled: true|false
  }, 
  {
    space: 'my-site-or-application-name',
    key: 'my-second-feature',
    enabled: true|false
  }
])
```

### update
Enable/Disable a feature in draft

```javascript
update({
  space: 'my-site-or-application-name',
  feature: 'my-feature',
  enabled: true|false
})
```

### publishFeature
Publishes feature from draft to master

```javascript
publishFeature({
  space: 'my-site-or-application-name',
  feature: 'my-feature'
})
```