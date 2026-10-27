// middleware/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
    },
    async (email, password, done) => {
        email = email.toLowerCase();
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Email is not registered' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Incorrect password. Please try again' });
            }
            return done(null, user);
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: '66090628916-2kuadtd1l6hvbs093g0a4mvbt9d8mbd0.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await UserModel.findOne({ email: profile.emails[0].value });
            if (!user) {
                user = new UserModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                });
                await user.save();
            }
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
