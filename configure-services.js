//This file configure the application service and exports them in the form of a service container

const ThemeManager = require('./services/theme-manager');
const SettingsManager = require('./services/settings-manager');
const ViewRenderer = require('./services/view-renderer');
const configuration = require('./wallnut.json');


//Creates the services and returns the service container
module.exports = async function configureServices(app) {
    try {
        const serviceContainer = {}
        
        serviceContainer.themeManager = new ThemeManager(configuration.themesDirectory);
        serviceContainer.settingsManager = await createSettingsManager(serviceContainer.themeManager);
        serviceContainer.viewRenderer = await createViewRenderer(configuration, app, serviceContainer.themeManager, serviceContainer.settingsManager);
        
        await setSeedSettings(configuration, serviceContainer.settingsManager);
        
        return serviceContainer;
    } catch(error) {
        console.log(`Failed to create the service container: ${error}`);
    }
}


async function createSettingsManager(themeManager) {
    try {
        settingsManager = new SettingsManager(themeManager);
        
        themeManager.on('theme-activated', async() => {
            try {
                await settingsManager.clearThemeSettings();
                siteSettings = settingsManager.getActiveThemeSetting('siteSettings');
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('Set the following site settings based on the theme config:');
                }
                
                Object.keys(siteSettings).forEach(async(key) => {
                    await settingsManager.setSiteSetting(key, siteSettings[key], true);
                    
                    if (process.env.NODE_ENV === 'development') {
                        console.log(key + ': ' + siteSettings[key]);
                    }
                });
            } catch(error) {
                console.log(`Failed to update the site settings to the latest theme: ${error}`);
            }
        });
        
        await settingsManager.loadSiteSettings();
        return settingsManager;
        
    } catch(error) {
        console.log(`Failed to create the settingsManager: ${error}`);
    }
}

async function createViewRenderer(configuration, app, themeManager, settingsManager) {
    try {
        const viewRenderer = new ViewRenderer(app, 'pug');
        
        //Expose certain setting service functions to the template
        viewRenderer.setViewInjection({
            getActiveThemeSetting: settingsManager.getActiveThemeSetting,
            getSiteSetting: settingsManager.getSiteSetting
        });
        
        //Update the viewMap whenever the theme changes
        themeManager.on('theme-activated', async () => {
            try {
                //Reset the view map
                viewRenderer.clearViewPaths();
                await viewRenderer.populateViewMap(configuration.coreViews);
                
                //Update the view map with the new theme's views
                viewRenderer.populateViewMap(themeManager.getActiveThemeDirectory());
            } catch(error) {
                console.log(`Failed to update view renderer to new theme: ${error}`);
            }
        });
        
        //Ensure the initial views have been loaded at the start
        await viewRenderer.populateViewMap(configuration.coreViews);
        
        return viewRenderer;
    } catch(error) {
        console.log(`Failed to create view renderer: ${error}`);
    }
}

//Add the seed settings to the database
async function setSeedSettings(configuration, settingsManager) {
    try {
        let settingsSet = {};
        
        for (let setting in configuration.seedSettings) {
            if (!settingsManager.getSiteSetting(setting)) {
                await settingsManager.setSiteSetting(setting, configuration.seedSettings[setting]);
                settingsSet[setting] = configuration.seedSettings[setting];
            }
        }
        
        if (Object.keys(settingsSet).length > 0) {
            console.log(`The following seed data was saved to the database: ${JSON.stringify(settingsSet)}`);
        }
    } catch(error) {
        console.log(`Failed to set the site seed settings: ${error}`);
    }
}
