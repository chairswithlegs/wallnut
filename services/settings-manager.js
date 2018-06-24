const path = require('path');

function SettingsManager(settingModel, themeManager) {
    let siteSettingsCache;
    
    this.Setting = settingModel;

    this.getSiteSetting = function(setting) {
        return siteSettingsCache[setting]
    }

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

SettingsManager.prototype.getActiveThemeSetting = function(setting) {
    return this.themeManager.getActiveThemeSetting(setting);
}

SettingsManager.prototype.setSiteSetting = function(key, value) {
    return new Promise((resolve, reject) => {
        this.Setting.findOne({ key: key }, (error, setting) => {
            if (error) {
                reject(error);
            } else if (!setting) {
                Setting.create({ key: key, value: value }, (error, setting) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.loadSiteSettings();
                        resolve(setting);
                    }
                });
            } else {
                setting.value = value;
                setting.save((error, updatedSetting) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.loadSiteSettings();
                        resolve(updatedSetting);
                    }
                });
            }
        });
    });
}

module.exports = async function(configuration, themeManager) {
    Setting = require(`${path.resolve(configuration.modelsDirectory)}/setting.js`);
    settingsManager = new SettingsManager(Setting, themeManager);
    await settingsManager.loadSiteSettings();
    return settingsManager;
}
