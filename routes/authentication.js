//This file manages the /admin/authentication route

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = function(viewManager) {
    //The instance we will be returning (see below)
    const router = express.Router();
    
    //Get Methods
    router.get('/login', async(req, res) => {
        const html = await viewManager.renderPageAsync('admin-login');
        res.header('Content-Type', 'text/html').send(html);
    });

    //Post Methods
    router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
        const token = jwt.sign({ username: req.user.username }, process.env.JWT_KEY);
        res.json({ token: token });
    });
    
    return router;
}