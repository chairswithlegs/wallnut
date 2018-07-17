//This service is used to manage site settings in wallnut

const path = require('path');
const Setting = require('../models/setting');

function SettingsManager() {
    let siteSettingsCache = {}
    
    //Getter for the site setting cache
    this.getSiteSetting = function(setting) {
        return siteSettingsCache[setting];
    }
    
    //Syncs the cache with the database
    this.loadSiteSettings = function() {
        return new Promise((resolve, reject) => {
            Setting.find({}, (error, settings) => {
                if (error) {
                    reject(error);
                } else {
                    siteSettingsCache = {};

                    if (settings) {
                        settings.forEach((setting) => {
                            siteSettingsCache[setting.key] = setting.value;
                        });
                    }

                    Object.freeze(siteSettingsCache);

                    resolve(siteSettingsCache);
                }
            });
        });
    }
}

//Add or update a site setting in the database
SettingsManager.prototype.setSiteSetting = function(key, value, themeSetting=false, hidden=false) {
    return new Promise((resolve, reject) => {
        Setting.findOne({ key: key }, (error, setting) => {
            if (error) {
                reject(error);
            } else if (!setting) { //If the setting doesn't exist, create it
                Setting.create({ key: key, value: value, themeSetting: themeSetting, hidden: hidden }, (error, setting) => {
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

module.exports = SettingsManager;
