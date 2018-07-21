# Wallnut

*Note: Wallnut refers to a type of rock climbing gear that consists of a metal "nut" on wire. While modest in appearance, its light weight and strength are unbeatable making it a key part of every climber's rack.*


## Table Of Contents

1. [Getting Started](#getting-started)  
	1.1 [Installing](#installing)  
	1.2 [Configuration](#configuration)  
	1.3 [Running Wallnut](#running-wallnut)  
2. [Theming](#theming)  
	2.1 [Creating A Theme](#creating-a-theme)  
	2.2 [Writing Templates In Pug](#writing-templates-in-pug)  
	2.3 [Template Context](#template-context)  
3. [License](#license)  


## Getting Started

These instructions will get you up and running with a new installation of Wallnut.

Note: running Wallnut will require Git, [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).


### Installing

Begin by cloning this repository

	git clone https://github.com/chairswithlegs/wallnut.git
    
   
Next, navigate to the folder containing the package.json file and execute the following command:

	npm install
    
Wallnut will also require an active MongoDB database; you can create a database for free by signing up at [mLab](https://mlab.com/).


### Configuration

If this is a production environment, or port 3000 is already in use, you may need to change the following settings as well:

	"baseUrl": "YOUR SITE DOMAIN",
    "port": "YOUR PORT NUMBER",

Several environment variables will need to be set as well. Wallnut makes use of the NPM package *dotenv* for to make setting environment variables easy. To do this, create a file named *.env* in the root directory of the project, open it in your preferred text editor, and enter the following:

	CONNECTION_STRING=THE CONNECTION STRING FOR YOUR DATABASE
	JWT_KEY=YOUR SECRET KEY

You may also want to set *NODE_ENV* to *development* for enhanced error logging and application life-cycle alerts.

Finally, you will need to create a site admin account. You can do this by running executing the following command:

	npm run create-user -- --username <USERNAME> --password <PASSWORD>


### Running Wallnut

Once Wallnut has been successfully configured and installed, you can start the application by executing:

	npm start
    
This will create a local server at the port specified in *Wallnut.json* (e.g. localhost:3000).

Code linting and unit testing can also be performed by executing the following commands:

	npm run lint
    npm test


## Theming

Wallnut includes a theme system that is both easy to use and deeply customizable; any visibile part of the site, including the admin interface, can be manipulated via custom themes.


### Creating A Theme

To make a new theme, begin by creating a new directory in the *themes* folder - the name of this directory will be the theme name. At this point, the theme can be activated by visiting */admin/themes* while the server is running and selecting your new theme.


### Writing Templates In Pug

Themes in Wallnut make heavy use of the [Pug](https://pugjs.org) templating language, which features a simple HTML-like language. To change the appearance of any part of your Wallnut site, create a new *.pug* file in the root of your theme directory; the specific name of the new template file will determine which part of the site is modified. Themes templates work by overriding the core Wallnut templates located in the *views* directory. For example, a template named *blog.pug* in the theme directory will override the core template located in *views*.

To learn more about writing templates in Pug, click [here](https://pugjs.org/api/getting-started.html) to checkout the tutorials on pugjs.org. You can also take a look at the files in *views* to get a sense of how Pug interacts with Wallnut.


### Template Context

Site and theme settings are made available to all view templates via the following functions:

    var siteTitle = getSiteSetting('Site Title');
    var themeName = getActiveThemeSetting('Theme Name');

Certain templates are passed additional data based on the specific URL that is being accessed. The following is a list of each template and the data that is included in its context.

#### blog.pug

A *posts* object is added to the blog.pug context and can be used to create the blog feed.

    each post in posts
        h1= post.title
        h2= `Written by ${post.author}`


#### post.pug

Post data can be accessed in post.pug by using the injected *post* object.

    h1= post.title
    p= post.content


#### admin-posts.pug

Similar to blog.pug, admin-posts.pug is also offered a *posts* object.

    each post in posts
        h1= post.title
        h2= `Written by ${post.author}`


#### admin-edit-post.pug

Similar to post.pug, admin-posts.pug can accesss the post data via the *post* object.

    h1= post.title
    p= post.content


#### admin-themes.pug

An array of the names of installed themes are injected via *themeList* and the active theme name can be accessed by *activeTheme*.
    each theme in themeList
        h1= theme
        
        if theme === activeTheme
            h2 Active


#### layout.pug

The layout.pug context includes: *header, content, footer* and (optionally) *themeScripts*. *header* and *footer* are the rendered header.pug and footer.pug templates (or admin-header.pug and admin-footer.pug if rendering an admin view). *content* is also a rendered template that varies based on the URL being accessed (e.g. when request is for '/blog' then content becomes the HTML rendered by blog.pug). *themeScripts* is also available to the layout.pug context if theme-scripts.pug is present in the active theme's directory, otherwise it will be *undefined*.

    head
        if themeScripts
            != themeScripts
    body
        header!= header    
        div!= content
        footer!= footer


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.