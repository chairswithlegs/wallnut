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
                if (error) { reject(error) }
                
                files.forEach((file) => {
                    splitFile = file.split('.');
    
                    if (splitFile[1] === 'pug') {
                        viewMap[splitFile[0]] = `${directory}/${file}`;
                    }
                });

                resolve();
            });
        });
    }

    //Public
    //A wrapper for Express.App.render that uses view mapping and is async/await friendly
    viewManager.renderAsync = async function(template, options={}, useViewMap=true) {
        //Using the view maps allows for simple names (e.g. blog)
        if (useViewMap) {
            template = viewMap[template];
        }

        return new Promise((resolve, reject) => {
            app.render(template, options, (error, html) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(html);
                }
            });
        });
    }

    //Convenience function for that automatically adds the header, footer, and layout templates
    viewManager.renderPageAsync = async function(template, options={}, useViewMap=true) {
        layoutOptions = {
            header: await viewManager.renderAsync('header'),
            footer: await viewManager.renderAsync('footer'),
            content: await viewManager.renderAsync(template, options, useViewMap)
        }

        if (viewMap['theme-scripts']) {
            layoutOptions.themeScripts = await viewManager.renderAsync('theme-scripts');
        }

        return viewManager.renderAsync('layout', layoutOptions);
    }

    //Update the viewMap whenever the theme changes
    themeManager.events.on('theme-activated', async () => {
        //Reset the view map
        viewMap = {};
        await loadViews(configuration.coreViews);

        //Update the view map with the new theme's views
        loadViews(themeManager.getThemeDirectory());
    });

    //Setup and return the middleware function
    return viewManager;
}