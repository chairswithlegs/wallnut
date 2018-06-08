(async () => { //Wrapper for async/await compatibility
    
    /*
    * MODULES
    */
    
    //Update the environment variables
    require('dotenv').config();
    
    //Load modules here
    const express = require('express');
    const configuration = require('./wallnut.json');
    const viewManager = require('./middleware/view-manager');
    const mongoose = require('mongoose');
    
    //Modules with additional setup
    const themeManager = require('./services/theme-manager')(configuration);
    const blogRouter = require('./routes/blog')(configuration);
    
    
    /*
    * APP
    */
    
    //Create the App
    const app = express();
    
    //Template Engine
    app.set('view engine', 'pug');
    app.set('views', __dirname);
    
    //Middleware
    app.use(express.json());
    app.use(await viewManager(app, themeManager, configuration));
    themeManager.activateTheme('dev-theme');
    
    //Routes
    app.use('/blog', blogRouter);
    
    //TODO: Abstract base route into its own file
    app.get('/', async (req, res) => {
        let html1 = await res.view.renderAsync('post', {postName: 'This is the title', postBody: 'Body here'});
        res.header({ 'Content-Type': 'text/html' });
        res.write(html1);
        res.end();
    });
    
    //Connect to the database and, if successful, start the server
    mongoose.connect(process.env.CONNECTION_STRING).then(() => {
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`Server listening on port ${server.address().port}`);
        });
    })
    .catch((error) => console.log(error.message));
})();
