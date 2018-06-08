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
        //const blogContent = await res.renderAsync('blog');
        const blogContent = await res.view.renderAsync('blog');
    
        const html = await res.view.renderAsync('./views/layout', { content: blogContent }, false);
    
        res.setHeader('Content-Type', 'text/html');
        res.write(html);
        res.end();
    });
    
    router.get('/:postId', (req, res) => {
        Post.findById(req.params.postId, async (error, post) => {
            if (error) {
                res.status(500).send('Server error.');
            } else if (!post) {
                res.status(404).send('Post not found.');
            } else {
                postHtml = await res.view.renderAsync('post', { post: post });
                res.send(postHtml);
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

