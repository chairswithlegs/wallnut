const fs = require('fs');

module.exports = function(app, themeManager, configuration) {
    //The instance we will be binding to the Express response (see below)
    viewManager = {};
    
    //Private
    viewMap = {};

    //Loads views into the viewMap
    function loadViews(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir((directory), (error, files) => {
                files.forEach((file) => {
                    splitFile = file.split('.');
    
                    if (splitFile[1] === 'pug') {
                        viewMap[splitFile[0]] = `${directory}/${file}`;
                    }
                });
            });
        });
    }

    //Public
    //A wrapper for Express.App.render that uses view mapping and is async/await friendly
    viewManager.asyncRender = async function(name, options={}, useViewMap=true) {
        //Using the view maps allows for simple names (e.g. blog)
        if (useViewMap) {
            name = viewMap[name];
        }
        
        return new Promise((resolve, reject) => {
            app.render(name, options, (error, html) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(html);
                }
            });
        });
    }

    //Update the viewMap whenever the theme changes
    themeManager.events.on('theme-activated', () => {
        //Reset the view map
        viewMap = {};
        loadViews(configuration.defaultThemeViews);

        //Update the view map with the new theme's views
        loadViews(`${themeManager.getThemeDirectory()}`);
    });

    //Setup and return the middleware function
    loadViews(configuration.defaultThemeViews);
    return function(req, res, next) {
        res.view = viewManager;
        next();
    }
}