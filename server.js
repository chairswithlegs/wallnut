const express = require('express');
const app = express();

app.set('view engine', 'pug');

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${server.address().port}`);
});
