//This file configures the backend and launches the server

//Update the environment variables
require('dotenv').config();

const express = require('express');
const configuration = require('./wallnut.json');
const mongoose = require('mongoose');
const ThemeManager = require('./services/theme-manager');
const viewRendererFactory = require('./services/view-renderer');
const settingsManagerFactory = require('./services/settings-manager');
const rootRouterFactory = require('./routes/root');
const errorHandler = require('./middleware/error-handler');

//Create the database connection, Express app, and server
(async() => { //Simple wrapper to support async/await syntax
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        
        const app = express();
        serviceContainer = await configureServices(app, configuration);
        configureApp(app, configuration, serviceContainer);
        await setSeedSettings(configuration, serviceContainer.settingsManager);
        
        //FOR TESTING PURPOSES ONLY
        await serviceContainer.themeManager.setActiveTheme('dev-theme');
        
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`Server listening on port ${server.address().port}`);
        });
    } catch(error) {
        console.log(error);
    }
})();


//Creates services and manages dependencies
async function configureServices(app, configuration) {
    const serviceContainer = {}

    serviceContainer.themeManager = new ThemeManager(configuration.themesDirectory);
    serviceContainer.settingsManager = await settingsManagerFactory(configuration, serviceContainer.themeManager);
    serviceContainer.viewRenderer = await viewRendererFactory(configuration, app, serviceContainer.themeManager, serviceContainer.settingsManager);

    return serviceContainer;
}

//Configures the App pipeline
function configureApp(app, configuration, serviceContainer) {
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    app.use(express.json());
    app.use('/public', express.static('public'));

    const rootRouter = rootRouterFactory(serviceContainer.viewRenderer);
    app.use('/', rootRouter);

    app.use(errorHandler);
}

//Add the seed settings to the database
async function setSeedSettings(configuration, settingsManager) {
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
}
