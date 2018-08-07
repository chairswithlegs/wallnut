//This file contains script functions for Wallnut

require('dotenv').config();
const yargs = require('yargs').demand(['username', 'password']);
const mongoose = require('mongoose');
const User = require('../models/user');

createUser(yargs.argv.username, yargs.argv.password);

async function createUser(username, password) {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);

        const newUser = new User({
            username: username,
            password: password
        });

        await new Promise((resolve, reject) => {
            newUser.save((error, user) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        console.log('User successfully created in database.');
        process.exit();
    } catch(error) {
        console.log(error);
        process.exit();
    }
};

