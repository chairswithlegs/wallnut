//This file manages the '/blog' route

const express = require('express');
const path = require('path');

module.exports = function(configuration) {
    //The instance we will be returning (see below)
    const router = express.Router();

    //Private
    const User = require(path.resolve(`${configuration.modelsDirectory}/user`));
    const Post = require(path.resolve(`${configuration.modelsDirectory}/post`));
    
    //Public
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

            const html = await res.view.renderPageAsync('blog', { posts: posts });
            res.header('Content-Type', 'text/html').send(html);

        } catch(error) {
            console.log(error);
            res.status(500).send('Server error.');
        }
    });
    
    router.get('/:postId', (req, res) => {
        Post.findById(req.params.postId, async (error, post) => {
            if (error) {
                res.status(500).send('Server error.');
            } else if (!post) {
                res.status(404).send('Post not found.');
            } else {
                const html = await res.view.renderPageAsync('post', { post: post });
                res.header('Content-Type', 'text/html').send(html);
            }
        });
    });

    router.post('/create-post', (req, res) => {
        if (!req.body.title || !req.body.content || !req.body.author) {
            res.status(400).send('Error: Post must include a title, content, and author.');
        } else {
            //Populate the new post with the request values
            let post = {
                title: req.body.title,
                content: req.body.content,
                author: req.body.author
            }
            if (req.body.date) { post.date = req.body.date } //Optionally add date

            //Attempt to create the post in the database
            Post.create(post, (error, post) => {
                if (error) {
                    res.status(500).send('Error: Failed to create post.');
                } else {
                    res.json(post);
                }
            });
        }
    });

    return router;
}

