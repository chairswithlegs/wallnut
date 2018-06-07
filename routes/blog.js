//This file manages the '/blog' route

const router = require('express').Router();
module.exports = router;

router.get('/', async(req, res) => {
    //const blogContent = await res.asyncRender('blog');
    const blogContent = await res.asyncRender(res.viewMap.getView('blog'));

    const html = await res.asyncRender('./views/layout', { content: blogContent });

    res.header({ 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
});

router.get('/:postId', async(req, res) => {
    const postContent = await res.asyncRender('post');

    res.header({ 'Content-Type': 'text/html' });
    res.write(postContent);
    res.end();
});
