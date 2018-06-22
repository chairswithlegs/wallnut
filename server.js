//This file configures the backend and launches the server

//Update the environment variables
require('dotenv').config();

const express = require('express');
const configuration = require('./wallnut.json');
const mongoose = require('mongoose');
const ThemeManager = require('./services/theme-manager');
const viewManager = require('./services/view-manager');
const settingsManager = require('./services/settings-manager');
const blogRouter = require('./routes/blog');
const adminRouter = require('./routes/admin');


//Create the database connection, Express app, and server
(async() => { //Simple wrapper to support async/await syntax
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        
        const app = express();
        serviceContainer = await configureServices(app);
        configureApp(app, serviceContainer);
        await setSeedSettings(serviceContainer.settingsManager);
        
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
async function configureServices(app) {
    const serviceContainer = {}

    serviceContainer.themeManager = new ThemeManager(configuration.themesDirectory);

    serviceContainer.settingsManager = await settingsManager(configuration, serviceContainer.themeManager);
    serviceContainer.viewManager = await viewManager(app, serviceContainer.themeManager, serviceContainer.settingsManager, configuration);
    serviceContainer.blogRouter = blogRouter(configuration, serviceContainer.viewManager);
    serviceContainer.adminRouter = adminRouter(configuration, serviceContainer.viewManager);

    return serviceContainer;
}

//Configures the App pipeline
function configureApp(app, serviceContainer) {
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    app.use(express.json());
    app.use('/blog', serviceContainer.blogRouter);
    app.use('/admin', serviceContainer.adminRouter);
}

//Add the seed settings to the database
async function setSeedSettings(settingsManager) {
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
