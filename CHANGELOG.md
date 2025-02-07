# @item-enonic-types/lib-feature-toggles

## 1.0.0

### Major Changes

- dfe7ace: Remove services. The Feature Toggles App will expose an API trough Guillotine instead
- dfe7ace: Make `app.name` the default space name instead of the Site name
- dfe7ace: Re-implement the API while maintaining feature parity
- dfe7ace: Change the name of the library to "lib-xp-feature-toggles". Change the path of the library to "/lib/feature-toggles".

### Minor Changes

- dfe7ace: Add `initRepo()` function that can be called from the applications main.{js,ts} file to initialize the XP-repository and roles.
- dfe7ace: Update documentation
