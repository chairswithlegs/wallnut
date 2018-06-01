//This file manages the '/blog' route

const router = require('express').Router();
module.exports = router;

router.get('/', async(req, res) => {
    const blogContent = await res.asyncRender('blog');

    res.header({ 'Content-Type': 'text/html' });
    res.write(blogContent);
    res.end();
});

router.get('/:postId', async(req, res) => {
    const postContent = await res.asyncRender('post');

    res.header({ 'Content-Type': 'text/html' });
    res.write(postContent);
    res.end();
});
