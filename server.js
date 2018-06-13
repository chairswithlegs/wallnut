(async () => { //Wrapper for async/await compatibility
    
    /*
    * MODULES
    */
    
    //Update the environment variables
    require('dotenv').config();
    
    //Load modules here
    const express = require('express');
    const configuration = require('./wallnut.json');
    const mongoose = require('mongoose');
    
    //Modules with additional setup
    const app = express();

    const themeManager = require('./services/theme-manager')(configuration);
    const viewManager = require('./services/view-manager')(app, themeManager, configuration);
    const blogRouter = require('./routes/blog')(configuration, viewManager);
    themeManager.activateTheme('dev-theme');
    
    /*
    * APP
    */
    
    //Template Engine
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    
    //Middleware
    app.use(express.json());
    
    //Routes
    app.use('/blog', blogRouter);
    
    //Connect to the database and, if successful, start the server
    mongoose.connect(process.env.CONNECTION_STRING).then(() => {
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`Server listening on port ${server.address().port}`);
        });
    })
    .catch((error) => console.log(error.message));
})();
