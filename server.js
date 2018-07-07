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
const cookieParser = require('cookie-parser');

const passportJwt = require('passport-jwt');
const passportLocal = require('passport-local');
const passport = require('passport');
const User = require('./models/user');

//Create the database connection, Express app, and server
(async() => { //Simple wrapper to support async/await syntax
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        
        const app = express();
        configureAuth(app);
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


function configureAuth(app) {
    //Setup the 'Local' auth strategy, this will be used to verify the initial token payload
    passport.use(new passportLocal.Strategy((username, password, done) => {
        User.findOne({ username: username }, async(error, user) => {
            if (error) { 
                return done(error, false);
            } else if (!user) { 
                return done(undefined, false);
            }
            
            try {
                isCorrectPassword = await user.comparePassword(password);

                if (isCorrectPassword) {
                    return done(undefined, user);
                } else {
                    return done(undefined, false);
                }
            } catch(error) {
                return done(error, false);
            }
        });
    }));
    
    
    //Setup JWT auth strategy, will be used to verify client submitted cookies containing the JWTs
    function cookieExtractor(req) {
        let token;
        if (req && req.cookies)
        {
            token = req.cookies['jwt'];
        }
        return token;
    };

    const jwtOptions = {
        jwtFromRequest: passportJwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_KEY,
    };
    
    passport.use(new passportJwt.Strategy(jwtOptions, (payload, done) => {
        User.findOne({ username: payload.username }, (error, user) => {
            if (error) {
                done(error, false);
            } else if (user) {
                done(undefined, user);
            } else {
                done(undefined, false);
            }
        });
    }));

    //Create the default admin account if it doesn't already exist
    User.findOne({ username: configuration.adminCredentials.username }, (error, user) => {
        if (error) {
            throw new Error(error);
        } else if (!user) {
            const admin = new User({
                username: configuration.adminCredentials.username,
                password: configuration.adminCredentials.password
            });

            admin.save((error) => {
                if (error) {
                    throw new Error(error);
                } else {
                    console.log('Created default admin login in database.');
                }
            })
        }
    });
}

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
    
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(express.json());
    app.use('/public', express.static('public'));
    
    const rootRouter = rootRouterFactory(serviceContainer.viewRenderer, serviceContainer.settingsManager);
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
