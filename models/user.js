const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.pre('save', function(next) { //Don't use an arrow function, mongoose  will set 'this' to the user object
    bcrypt.hash(this.password, 6, (error, hash) => {
        if (error) {
            next(error);
        } else {
            this.password = hash;
            next();
        }
    });
});

userSchema.methods.comparePassword = function(password) { //Don't use an arrow function, mongoose  will set 'this' to the user object
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, this.password, (error, match) => {
            if (error) {
                reject(error)
            } else {
                resolve(match);
            }
        });
    });
}

module.exports = mongoose.model('User', userSchema);
