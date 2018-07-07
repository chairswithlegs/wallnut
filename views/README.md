# Core Views

The directory contains the core views used by Wallnut. All views in this directory can be overridden by the views present in the active theme.

To override a Core View, simply add an identically named template file to the root directory of the active theme. E.g. post.pug in the active theme directory will override post.pug in this directory.


# View Context

Site and theme settings are made available to all view templates via the following functions:

    var siteTitle = getSiteSetting('Site Title');
    var themeName = getActiveThemeSetting('Theme Name');

Additionally, certain templates are passed additional data based on the specific URL that is being accessed.


## blog.pug

A *posts* object is added to the blog.pug context and can be used to create the blog feed.

    each post in posts
        h1= post.title
        h2= `Written by ${post.author}`


## post.pug

Post data can be accessed in post.pug by using the injected *post* object.

    h1= post.title
    p= post.content


## admin-posts.pug

Similar to blog.pug, admin-posts.pug is also offered a *posts* object.

    each post in posts
        h1= post.title
        h2= `Written by ${post.author}`


## admin-edit-post.pug

Similar to post.pug, admin-posts.pug can accesss the post data via the *post* object.

    h1= post.title
    p= post.content


## layout.pug

The layout.pug context includes: *header, content, footer* and (optionally) *themeScripts*. *header* and *footer* are the rendered header.pug and footer.pug templates (or admin-header.pug and admin-footer.pug if rendering an admin view). *content* is also a rendered template that varies based on the URL being accessed (e.g. when request is for '/blog' then content becomes the HTML rendered by blog.pug). *themeScripts* is also available to the layout.pug context if theme-scripts.pug is present in the active theme's directory, otherwise it will be *undefined*.

    head
        if themeScripts
            != themeScripts
    body
        header!= header    
        div!= content
        footer!= footer