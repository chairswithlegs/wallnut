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
        //const blogContent = await res.asyncRender('blog');
        const blogContent = await res.view.asyncRender('blog');
    
        const html = await res.view.asyncRender('./views/layout', { content: blogContent }, false);
    
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
                postHtml = await res.asyncRender('post', { post: post });
                res.send(postHtml);
            }
        });
    });

    return router;
}

