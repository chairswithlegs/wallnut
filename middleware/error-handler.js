const express = require('express');

module.exports = function(error, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        console.log(error);
        res.write(JSON.stringify(error));
    }
    
    res.send('Server error.');
}
