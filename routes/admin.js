//This file manages the '/admin' route

const express = require('express');
const path = require('path');

module.exports = function(configuration, viewManager) {
    //The instance we will be returning (see below)
    const router = express.Router();

    //Private
    const User = require(path.resolve(`${configuration.modelsDirectory}/user`));
    const Post = require(path.resolve(`${configuration.modelsDirectory}/post`));
    
    //Public
    router.get('/', async(req, res) => {
        res.send('Welcome Page Here');
    });

    router.get('/posts', async(req, res) => {
        try {
            const posts = await new Promise((resolve, reject) => {
                Post.find({}, (error, posts) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(posts);
                    }
                });
            });

            html = await viewManager.renderAdminPageAsync('admin-posts', { posts: posts });
            res.header('Content-Type', 'text/html').send(html);

        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });

    router.get('/posts/:id', async(req, res) => {
        try {
            const post = await new Promise((resolve, reject) => {
                Post.findById(req.params.id, (error, post) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(post);
                    }
                });
            });

            html = await viewManager.renderAdminPageAsync('admin-edit-post', { post: post });
            res.header('Content-Type', 'text/html').send(html);

        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });

    router.put('/posts/:id', (req, res) => {
        console.log(req.body);
        res.end();
        //res.send(res.body);
    });

    router.post('/posts', (req, res) => {
        //Create a post
    });

    router.get('/settings', (req, res) => {
        //Display the site settings
    });

    router.put('/settings', (req, res) => {
        //Update the site settings
    });

    return router;
}