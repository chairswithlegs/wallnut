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

    router.get('/posts/create', async(req, res) => {
        html = await viewManager.renderAdminPageAsync('admin-edit-post');
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
            
            html = await viewManager.renderAdminPageAsync('admin-edit-post', { post: post });
            res.header('Content-Type', 'text/html').send(html);
            
        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });
    
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
    
    router.get('/settings', (req, res) => {
        //Display the site settings
    });
    
    router.put('/settings', (req, res) => {
        //Update the site settings
    });
    
    return router;
}