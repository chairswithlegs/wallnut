//This file manages the '/blog' route

const express = require('express');
const path = require('path');
const User = require('../models/user');
const Post = require('../models/post');

module.exports = function(serviceContainer) {
    //The instance we will be returning (see below)
    const router = express.Router();

    //Get Methods
    router.get('/', async(req, res) => {
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
            
            const html = await serviceContainer.viewRenderer.renderPageAsync('blog', { posts: posts });
            res.header('Content-Type', 'text/html').send(html);

        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });
    
    router.get('/:id', (req, res) => {
        Post.findById(req.params.id, async (error, post) => {
            if (error) {
                res.status(500).send('Server error.');
            } else if (!post) {
                res.status(404).send('Post not found.');
            } else {
                const html = await serviceContainer.viewRenderer.renderPageAsync('post', { post: post });
                res.header('Content-Type', 'text/html').send(html);
            }
        });
    });

    //Post Methods
    router.post('/', (req, res) => {
        if (!req.body.title || !req.body.content ) {
            res.status(400).send('Error: Post must include a title and content.');
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
                    res.status(500).send('Error: Failed to create post.');
                } else {
                    res.json(post);
                }
            });
        }
    });

    return router;
}

