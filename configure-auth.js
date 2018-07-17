//This file configures Passport, the middleware used to manage site authentication

const configuration = require('./wallnut.json');
const passportJwt = require('passport-jwt');
const passportLocal = require('passport-local');
const passport = require('passport');
const User = require('./models/user');

module.exports = function configureAuth(app) {
    //Setup the 'Local' auth strategy, this will be used to verify the initial token payload
    passport.use(new passportLocal.Strategy((username, password, done) => {
        User.findOne({ username: username }, async(error, user) => {
            if (error) { 
                return done(error, false);
            } else if (!user) { 
                return done(undefined, false);
            }
            
            try {
                isCorrectPassword = await user.comparePassword(password);

                if (isCorrectPassword) {
                    return done(undefined, user);
                } else {
                    return done(undefined, false);
                }
            } catch(error) {
                return done(error, false);
            }
        });
    }));
    
    
    //Setup JWT auth strategy, will be used to verify client submitted cookies containing the JWTs
    function cookieExtractor(req) {
        let token;
        if (req && req.cookies && req.cookies['jwt'])
        {
            token = req.cookies['jwt'].slice(7); //Extract the token and remove the 'Bearer' prefix
        }
        return token;
    };

    const jwtOptions = {
        jwtFromRequest: passportJwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_KEY,
    };
    
    passport.use(new passportJwt.Strategy(jwtOptions, (payload, done) => {
        User.findOne({ username: payload.username }, (error, user) => {
            if (error) {
                done(error, false);
            } else if (user) {
                done(undefined, user);
            } else {
                done(undefined, false);
            }
        });
    }));

    //Create the default admin account if it doesn't already exist
    User.findOne({ username: configuration.adminCredentials.username }, (error, user) => {
        if (error) {
            throw new Error(error);
        } else if (!user) {
            const admin = new User({
                username: configuration.adminCredentials.username,
                password: configuration.adminCredentials.password
            });

            admin.save((error) => {
                if (error) {
                    throw new Error(error);
                } else {
                    console.log('Created default admin login in database.');
                }
            })
        }
    });
}