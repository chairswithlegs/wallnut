const path = require('path');

module.exports = async function(configuration, themeManager) {
    settingsManager = {};

    //Private
    Setting = require(`${path.resolve(configuration.modelsDirectory)}/setting.js`);
    siteSettingsCache = {};
    
    function loadSiteSettings() {
        return new Promise((resolve, reject) => {
            Setting.find({}, (error, settings) => {
                if (error) {
                    reject(error);
                } else {
                    settings.forEach((setting) => {
                        siteSettingsCache[setting.key] = setting.value;
                    });

                    resolve(siteSettingsCache);
                }
            });
        });
    }

    //Public
    settingsManager.getThemeSetting = function(setting) {
        return themeManager.getSetting(setting);
    }
    
    settingsManager.getSiteSetting = function(setting) {
        //Return copies of objects, not actual references (to prevent accidental modification)
        if (typeof siteSettingsCache[setting] === 'object') {
            return Object.assign({}, siteSettingsCache[setting]);
        }
        
        return siteSettingsCache[setting]
    }
    
    settingsManager.setSiteSetting = function(key, value) {
        return new Promise((resolve, reject) => {
            Setting.findOne({ key: key }, (error, setting) => {
                if (error) {
                    reject(error);
                } else if (!setting) {
                    Setting.create({ key: key, value: value }, (error, setting) => {
                        if (error) {
                            reject(error);
                        } else {
                            loadSiteSettings();
                            resolve(setting);
                        }
                    });
                } else {
                    setting.value = value;
                    setting.save((error, updatedSetting) => {
                        if (error) {
                            reject(error);
                        } else {
                            loadSiteSettings();
                            resolve(updatedSetting);
                        }
                    });
                }
            });
        });
    }

    await loadSiteSettings();
    return settingsManager;
}