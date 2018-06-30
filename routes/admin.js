//This file manages the '/admin' route

const express = require('express');
const path = require('path');
const User = require('../models/user');
const Post = require('../models/post');
const Setting = require('../models/setting');

module.exports = function(viewManager, settingsManager) {
    //The instance we will be returning (see below)
    const router = express.Router();

    //Get Methods
    router.get('/', async(req, res) => {
        const html = await viewManager.renderAdminPageAsync('admin-dashboard');
        res.header('Content-Type', 'text/html').send(html);
    });

    router.get('/login', async(req, res) => {
        const html = await viewManager.renderPageAsync('admin-login');
        res.header('Content-Type', 'text/html').send(html);
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
            
            const html = await viewManager.renderAdminPageAsync('admin-posts', { posts: posts });
            res.header('Content-Type', 'text/html').send(html);
            
        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });

    router.get('/posts/create', async(req, res) => {
        const html = await viewManager.renderAdminPageAsync('admin-edit-post');
        res.header('Content-Type', 'text/html').send(html);
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
            
            const html = await viewManager.renderAdminPageAsync('admin-edit-post', { post: post });
            res.header('Content-Type', 'text/html').send(html);
            
        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });

    router.get('/settings', async(req, res) => {
        Setting.find({}, async(error, settings) => {
            if (error) {
                throw new Error(error);
            } else {
                settings = settings.map((setting) => {
                    return { key: setting.key, value: setting.value }
                });

                const html = await viewManager.renderAdminPageAsync('admin-settings', { settings: settings });
                res.header('Content-Type', 'text/html').send(html);
            }
        });
    });
    
    //Post Methods
    router.post('/posts', (req, res) => {
        try {
            if (!req.body.title || !req.body.content) {
                res.status(400).send('Post must include a title and content.');
            } else {
                //Populate the new post with the request values
                let post = {
                    title: req.body.title,
                    content: req.body.content,
                }
                if (req.body.date) { post.date = req.body.date } //Optionally add date
                
                //Attempt to create the post in the database
                Post.create(post, (error, post) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Server error.');
                    } else {
                        res.json(post);
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });
    
    //Put Methods
    router.put('/posts/:id', (req, res) => {
        try {
            if (!req.body.title || !req.body.content || !req.body.id) {
                res.status(400).send('Post must include a title, content, and id.');
            } else {
                Post.findById(req.body.id, (error, post) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Server error.');
                    } else if (!post) {
                        res.status(400).send('Post not found.');
                    } else {
                        post.title = req.body.title;
                        post.content = req.body.content;
                        post.save((error, updatedPost) => {
                            if (error) {
                                res.status(500).send('Server error.');
                            } else {
                                res.json(updatedPost);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });

    router.put('/settings', (req, res) => {
        settings = req.body;
        dbOperations = [];

        //Update each setting in the database
        for (let setting in settings){
            dbOperations.push(new Promise((resolve, reject) => {
                Setting.update({ key: setting }, { value: settings[setting] }, (error, _setting) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(_setting);
                    }
                });
            }));
        }

        //If the updates work send the reponse and update the settings cache
        Promise.all(dbOperations)
        .then(() => {
            res.send(settings);
            settingsManager.loadSiteSettings();
        });
    });
    
    return router;
}