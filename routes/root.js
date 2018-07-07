/*
* This file manages the root ('/') route
*
* This router also serves as the entry point for all other routers.
*/

const express = require('express');
const path = require('path');
const blogRouterFactory = require('./blog');
const adminRouterFactory = require('./admin');


module.exports = function(serviceContainer) {
    //The instance we will be returning (see below)
    const router = express.Router();

    router.use('/blog', blogRouterFactory(serviceContainer));
    router.use('/admin', adminRouterFactory(serviceContainer));

    router.get('/', async(req, res) => {
        const html = await serviceContainer.viewRenderer.renderPageAsync('front-page');
        res.header('Content-Type', 'text/html').send(html);
    });

    //404 response
    router.get('*', async(req, res) => {
        const html = await serviceContainer.viewRenderer.renderPageAsync('404');
        res.header('Content-Type', 'text/html').send(html);
    });

    return router;
}
