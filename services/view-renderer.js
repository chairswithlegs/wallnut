const fs = require('fs');

function ViewRenderer(app, viewExtension) {
    //This ref will be injected into views rendered by this object
    let viewInjection = {}
    let viewMap = {};

    this.app = app;
    this.viewExtension = viewExtension;
 
    this.getViewInjection = function() {
        return this.viewInjection;
    }

    this.setViewInjection = function(injection) {
        if (typeof(injection) != 'object') {
            throw new Error('View injection must be an object');
        } else {
            this.viewInjection = injection;
        }
    }

    this.getViewPath = function(view) {
        return viewMap[view];
    }

    this.clearViewPaths = function() {
        viewMap = {};
    }

    //Loads template paths into the view map
    this.populateViewMap = function(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir((directory), (error, files) => {
                if (error) { reject(error) }
                
                files.forEach((file) => {
                    splitFile = file.split('.');

                    if (splitFile[1] === this.viewExtension) {
                        viewMap[splitFile[0]] = `${directory}/${file}`;
                    }
                });
                
                resolve(true);
            });
        });
    }
}

//Renders a view into HTML
ViewRenderer.prototype.renderAsync = async function(view, options={}, useViewMap=true) {
    //Using the view maps allows for simple names (e.g. blog)
    if (useViewMap) {
        let viewPath = this.getViewPath(view);
        
        if (viewPath === undefined) {
            throw new Error(`View named ${view} could not be found.`);
        } else {
            view = viewPath;
        }
    }

    //Add the view injection to the view context
    const injection = this.getViewInjection();
    for (let injectionKey in injection) {
        options[injectionKey] = injection[injectionKey];
    }

    //Render the view
    return new Promise((resolve, reject) => {
        this.app.render(view, options, (error, html) => {
            if (error) {
                reject(error);
            } else {
                resolve(html);
            }
        });
    });
}

//Convenience function that automatically adds the header, footer, and layout templates
ViewRenderer.prototype.renderPageAsync = async function(view, options={}, useViewMap=true) {
    layoutOptions = {
        header: await this.renderAsync('header'),
        footer: await this.renderAsync('footer'),
        content: await this.renderAsync(view, options, useViewMap)
    }
    
    if (this.getViewPath('theme-scripts')) {
        layoutOptions.themeScripts = await this.renderAsync('theme-scripts');
    }
    
    return this.renderAsync('layout', layoutOptions);
}

//Convenience function that automatically adds the admin layout template
ViewRenderer.prototype.renderAdminPageAsync = async function(view, options={}, useViewMap=true) {
    layoutOptions = {
        header: await this.renderAsync('admin-header'),
        footer: await this.renderAsync('admin-footer'),
        content: await this.renderAsync(view, options, useViewMap)
    }
    
    if (this.getViewPath('theme-scripts')) {
        layoutOptions.themeScripts = await this.renderAsync('theme-scripts');
    }
    
    return this.renderAsync('layout', layoutOptions);
}


module.exports = async function(configuration, app, themeManager, settingsManager) {
    const viewRenderer = new ViewRenderer(app, 'pug');

    //Expose certain setting service functions to the template
    viewRenderer.setViewInjection({
        getActiveThemeSetting: settingsManager.getActiveThemeSetting,
        getSiteSetting: settingsManager.getSiteSetting
    });
    
    //Update the viewMap whenever the theme changes
    themeManager.on('theme-activated', async () => {
        //Reset the view map
        viewRenderer.clearViewPaths();
        await viewRenderer.populateViewMap(configuration.coreViews);
        
        //Update the view map with the new theme's views
        viewRenderer.populateViewMap(themeManager.getActiveThemeDirectory());
    });

    await viewRenderer.populateViewMap(configuration.coreViews);
    
    return viewRenderer;
}
