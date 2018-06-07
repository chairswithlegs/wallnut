/*
* MODULES
*/

//Load

const express = require('express');
const blogRouter = require('./routes/blog');
const configuration = require('./wallnut.json');
const themeManager = require('./services/theme-manager')(configuration);
const viewManager = require('./middleware/view-manager');
const mongoose = require('mongoose');

//Configure
const app = express();
const db = mongoose.connect(process.env.CONNECTION_STRING);

/*
* APP
*/

//Template Engine
app.set('view engine', 'pug');
app.set('views', __dirname);

//Middleware
app.use(viewManager(app, themeManager, configuration));
themeManager.activateTheme('dev-theme');

//Routes
app.use('/blog', blogRouter);

//TODO: Abstract base route into its own file
app.get('/', async (req, res) => {
    let html1 = await res.asyncRender('post', {postName: 'This is the title', postBody: 'Body here'});
    res.header({ 'Content-Type': 'text/html' });
    res.write(html1);
    res.end();
});

//Start the server
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${server.address().port}`);
});
