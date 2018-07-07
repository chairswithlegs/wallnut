//This service is used to manage theme and site settings in wallnut

const path = require('path');

function SettingsManager(settingModel, themeManager) {
    let siteSettingsCache;
    
    this.Setting = settingModel;

    //Getter for the site setting cache
    this.getSiteSetting = function(setting) {
        return siteSettingsCache[setting]
    }

    //Syncs the cache with the database
    this.loadSiteSettings = function() {
        return new Promise((resolve, reject) => {
            this.Setting.find({}, (error, settings) => {
                if (error) {
                    reject(error);
                } else {
                    siteSettingsCache = {};

                    settings.forEach((setting) => {
                        siteSettingsCache[setting.key] = setting.value;
                    });

                    Object.freeze(siteSettingsCache);

                    resolve(siteSettingsCache);
                }
            });
        });
    }
}

//Add or update a site setting in the database
SettingsManager.prototype.setSiteSetting = function(key, value) {
    return new Promise((resolve, reject) => {
        this.Setting.findOne({ key: key }, (error, setting) => {
            if (error) {
                reject(error);
            } else if (!setting) { //If the setting doesn't exist, create it
                Setting.create({ key: key, value: value }, (error, setting) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.loadSiteSettings(); //Sync the cache
                        resolve(setting);
                    }
                });
            } else { //If the setting does exist, update it
                setting.value = value;
                setting.save((error, updatedSetting) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.loadSiteSettings(); //Sync the cache
                        resolve(updatedSetting);
                    }
                });
            }
        });
    });
}

//Getter for the active theme setting (generated from the theme config)
SettingsManager.prototype.getActiveThemeSetting = function(setting) {
    return this.themeManager.getActiveThemeSetting(setting);
}

//Async factory function to ensure cache is loaded before making the service available
module.exports = async function(configuration, themeManager) {
    Setting = require(`${path.resolve(configuration.modelsDirectory)}/setting.js`);
    settingsManager = new SettingsManager(Setting, themeManager);
    await settingsManager.loadSiteSettings();
    return settingsManager;
}
