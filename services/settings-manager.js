//This service is used to manage theme and site settings in wallnut

const path = require('path');
const Setting = require('../models/setting');

function SettingsManager(themeManager) {
    let siteSettingsCache;
    
    this.themeManager = themeManager;
    
    //Getter for the site setting cache
    this.getSiteSetting = function(setting) {
        return siteSettingsCache[setting]
    }
    
    //Syncs the cache with the database
    this.loadSiteSettings = function() {
        return new Promise((resolve, reject) => {
            Setting.find({}, (error, settings) => {
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
SettingsManager.prototype.setSiteSetting = function(key, value, themeSetting=false) {
    return new Promise((resolve, reject) => {
        Setting.findOne({ key: key }, (error, setting) => {
            if (error) {
                reject(error);
            } else if (!setting) { //If the setting doesn't exist, create it
            Setting.create({ key: key, value: value, themeSetting: themeSetting }, (error, setting) => {
                if (error) {
                    reject(error);
                } else {
                    this.loadSiteSettings(); //Sync the cache
                    resolve(setting);
                }
            });
        } else { //If the setting does exist, update it
            setting.value = value;
            setting.themeSetting = themeSetting;
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

//Removes any theme settings from the database
SettingsManager.prototype.clearThemeSettings = function() {
    return new Promise((resolve, reject) => {
        Setting.deleteMany({ themeSetting: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

//Async factory function to ensure cache is loaded before making the service available
module.exports = async function(configuration, themeManager) {
    settingsManager = new SettingsManager(themeManager);
    
    themeManager.on('theme-activated', async() => {
        await settingsManager.clearThemeSettings();
        siteSettings = settingsManager.getActiveThemeSetting('siteSettings');
        
        if (process.env.NODE_ENV) {
            console.log('Set the following theme settings:');
        }
        
        Object.keys(siteSettings).forEach((key) => {
            settingsManager.setSiteSetting(key, siteSettings[key], true);
            console.log(key + ': ' + siteSettings[key]);
        });
    });
    
    await settingsManager.loadSiteSettings();
    return settingsManager;
}
