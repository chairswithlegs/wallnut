//This file configures the backend and launches the server

//Set the environment variables
require('dotenv').config();

const configuration = require('./wallnut.json');
const configureServices = require('./configure-services');
const configureAuth = require('./configure-auth');
const express = require('express');
const mongoose = require('mongoose');
const rootRouterFactory = require('./routes/root');
const errorHandler = require('./middleware/error-handler');
const cookieParser = require('cookie-parser');
const passport = require('passport');

//Create the database connection, Express app, and server
(async() => { //Simple wrapper to support async/await syntax
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        
        const app = express();
        configureAuth(app);
        serviceContainer = await configureServices(app);
        configureMiddleware(app, serviceContainer);

        const server = app.listen(configuration.port || process.env.PORT || 3000, () => {
            console.log(`Server listening on port ${server.address().port}`);
        });
    } catch(error) {
        console.log(error);
    }
})();

//Configures the App pipeline
function configureMiddleware(app, serviceContainer) {
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    
    app.use(cookieParser());
    app.use(express.json());

    app.use(passport.initialize());
    app.use('/public', express.static('public'));
    
    const rootRouter = rootRouterFactory(serviceContainer);
    app.use('/', rootRouter);
    
    app.use(errorHandler);
}
