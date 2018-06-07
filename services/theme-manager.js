const fs = require('fs');
const path = require('path');

module.exports = function(configuration) {
    //The instance we will be returning (see below)
    const themeManager = {};

    //Private
    const defaultThemeConfig = require(path.resolve(configuration.defaultThemeConfig));
    const themeDirectory = configuration.themeDirectory;
    let themeConfig = defaultThemeConfig;

    //Public
    themeManager.getThemeList = function() {
        return new Promise((resolve, reject) => {
            //Get a list of all files in the theme directory
            fs.readdir(themeDirectory, (error, files) => {
                if (error) { reject(error); }

                const themes = [];
                let fileCounter = files.length;

                //Iterate through each file, and push any directory names to the theme list
                files.forEach((file) => {
                    fs.stat(`${themeDirectory}/${file}`, (error, stats) => {
                        fileCounter--;

                        if (error || !stats.isDirectory()) {
                            return;
                        } else {
                            themes.push(file);
                        }

                        //If this is the final file to iterate through, resolve the promise
                        if (fileCounter === 0) {
                            resolve(themes);
                        }
                    });
                });
            });
        });
    };

    themeManager.themeExists = function(themeName) {
        return new Promise((resolve, reject) => {
            fs.stat(`${themeDirectory}/${themeName}`, (error, stats) => {
                if (error || !stats.isDirectory()) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    };

    //Set the theme located in ./themes/<themeName> as the active theme
    themeManager.activateTheme = async function(themeName) {
        //Ensure theme exists
        const themeExists = await this.themeExists(themeName);
        if(themeExists === false) { throw new Error('Theme does not exist.'); }

        //Next, load the new theme config
        themeConfig = await new Promise((resolve, reject) => {
            fs.readFile(`${themeDirectory}/${themeName}/config.json`, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });

        //Reset the config to the base settings and overwrite as needed with the new theme settings
        themeManager.activeThemeConfig = defaultThemeConfig;
        for(let setting in themeConfig) {
            themeManager.activeThemeConfig[setting] = themeConfig[setting];
        }

        return true;
    };

    themeManager.getThemeName = function() {
        return themeConfig.themeName;
    };

    themeManager.getSetting = function(setting) {
        //Return copies of objects, not actual references (to prevent accidental modification)
        if (typeof themeConfig[setting] === 'object') {
            return Object.assign({}, themeConfig[setting]);
        }

        return themeConfig[setting];
    };

    return themeManager;
};
