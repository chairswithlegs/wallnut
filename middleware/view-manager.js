const fs = require('fs');

module.exports = function(app, themeManager, configuration) {
    //The instance we will be binding to the Express response
    viewManager = {};

    //Private
    viewMap = {};

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
    viewManager.asyncRender = async function(name, options={}) {
        return new Promise((resolve, reject) => {
            app.render(name, options, (err, html) => {
                if (err) {
                    reject(err);
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

    //Load the default views
    loadViews(configuration.defaultThemeViews);

    //Return the actual middleware function
    return function(req, res, next) {
        res.view = viewManager;
        next();
    }
}