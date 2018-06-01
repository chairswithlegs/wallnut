const configCore = require('../config.core.json');
const configDefaultTheme = require('../config.default-theme.json');
const fs = require('fs');

module.exports = (() => {
    //Load the initial configuration settings
    const configuration = {};
    addConfigSettings(configCore, 'core');
    addConfigSettings(configDefaultTheme, 'theme');
    
    function addConfigSettings(configSettings, category) {
        try {
            if (configuration[category] === undefined) {
                configuration[category] = {};
            }

            for(setting in configSettings) {
                configuration[category][setting] = configSettings[setting];
            }
        }
        catch(error) {
            console.log(`Failed to load settings. Error message: ${error}`);
        }
    }
    
    //Return the a constructor preloaded the base configuration
    return function ConfigManager() {
        this.configuration = configuration;
        
        this.loadThemeConfig = async function(configPath) {
            try {
                //Attempt to load the new theme config
                config = await new Promise((resolve, reject) => {
                    fs.readFile(configPath, (error,  data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(JSON.parse(data));
                        }
                    });
                });
                
                //Reset the configuration to the default theme settings
                configuration.theme = {};
                addConfigSettings(configDefaultTheme, 'theme');
                
                //Now overwrite using the new theme settings
                addConfigSettings(config, 'theme');
            } catch(error) {
                console.log(`Failed to load the theme configuration settings. Error message: ${error}`);
            }
        }
    }
})();