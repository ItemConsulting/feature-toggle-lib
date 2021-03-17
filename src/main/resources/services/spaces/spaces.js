const featureToggleLib = require('/lib/featureToggle')

exports.get = function(req) {
    return {
      body: {
          spaces: featureToggleLib.getSpaces()
      },
      contentType: 'application/json'
    };
  
  };