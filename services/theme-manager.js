//This service can be used for managing theme state and getting information about available themes

const fs = require('fs');
const EventEmitter = require('events');

//Represents a "theme" and couples a theme's name to its configuration
function ThemeSnapshot(name, config={}) {
    this.name = name;
    this.config = config;
    
    Object.freeze(this);
}

function ThemeManager(themesDirectory) {
    let activeTheme;
    
    this.themesDirectory = themesDirectory;
    
    this.setActiveTheme = async function(themeName) {
        //Ensure theme exists
        let exists = await this.themeExists(themeName);
        if (exists === false) { 
            throw new Error('Theme does not exist.'); 
        }
        
        //Load the new theme config
        const themeConfig = await new Promise((resolve, reject) => {
            fs.readFile(`${this.themesDirectory}/${themeName}/config.json`, (error, data) => {
                if (error && error.code === 'ENOENT') { //File does not exist error handling
                    resolve({});
                } else if (error) { //Propagate any other errors
                    reject(error);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
        
        //Send an alert if we are transitioning to a new theme
        //This is useful is we need to do any theme cleanup
        if (activeTheme && activeTheme.name !== themeName) {
            this.emit('new-theme-activated');
        }
        
        //Send an alert that a theme has been activated, useful for theme setup
        activeTheme = new ThemeSnapshot(themeName, themeConfig);

        this.emit('theme-loaded');
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`Theme activated: ${this.getActiveTheme()}`);
        }
    }
    
    this.getActiveTheme = function() {
        if (!activeTheme) {
            return undefined;
        }

        return activeTheme.name;
    }

    this.getActiveThemeSetting = function(setting) {
        if (activeTheme) {
            return activeTheme.config[setting];
        } else {
            if (NODE_ENV==='development') {
                console.log(`No active theme set. Failed to get setting: ${setting}.`);
            }

            return undefined;
        }  
    };
}

//Inherit from EventEmitter without risking modification of the EventEmitter prototype
ThemeManager.prototype.__proto__ = EventEmitter.prototype;

//Lists the names of the available themes (i.e. directory names in this.themesDirectory)
ThemeManager.prototype.getThemeList = function() {
    return new Promise((resolve, reject) => {
        //Get a list of all files in the theme directory
        fs.readdir(this.themesDirectory, (error, files) => {
            if (error) { reject(error); }
            
            const themes = [];
            let fileCounter = files.length;
            
            //Iterate through each file, and push any directory names to the theme list
            files.forEach((file) => {
                fs.stat(`${this.themesDirectory}/${file}`, (error, stats) => {
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

//Returns a boolean promise indicating if a theme exists
ThemeManager.prototype.themeExists = function(themeName) {
    return new Promise((resolve, reject) => {
        fs.stat(`${this.themesDirectory}/${themeName}`, (error, stats) => {
            if (error || !stats.isDirectory()) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

//Return the path of the current theme
ThemeManager.prototype.getActiveThemeDirectory = function() {
    return `${this.themesDirectory}/${this.getActiveTheme()}`;
};

module.exports = ThemeManager;
