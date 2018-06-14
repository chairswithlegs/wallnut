//Update the environment variables
require('dotenv').config();

//Load modules here
const express = require('express');
const configuration = require('./wallnut.json');
const mongoose = require('mongoose');
const themeManager = require('./services/theme-manager');
const viewManager = require('./services/view-manager');
const blogRouter = require('./routes/blog');
const adminRouter = require('./routes/admin');

//Create the app and configure
const app = express();

serviceContainer = configureServices(app);
configureApp(serviceContainer);

//FOR TESTING PURPOSES ONLY
serviceContainer.themeManager.activateTheme('dev-theme');

//Connect to the database and, if successful, start the server
mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    const server = app.listen(process.env.PORT || 3000, () => {
        console.log(`Server listening on port ${server.address().port}`);
    });
})
.catch((error) => console.log(error.message));

//Creates services and manages dependencies
function configureServices(app) {
    const serviceContainer = {}
    
    serviceContainer.themeManager = themeManager(configuration);
    serviceContainer.viewManager = viewManager(app, serviceContainer.themeManager, configuration);
    serviceContainer.blogRouter = blogRouter(configuration, serviceContainer.viewManager);
    serviceContainer.adminRouter = adminRouter(configuration, serviceContainer.viewManager);
    
    return serviceContainer;
}

//Configures the App pipeline
function configureApp(serviceContainer) {
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    app.use(express.json());
    app.use('/blog', serviceContainer.blogRouter);
    app.use('/admin', serviceContainer.adminRouter);
}
