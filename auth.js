const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => { done(null, user.uid) });
passport.deserializeUser((uid, done) => {
    db.query('SELECT * FROM users WHERE uid=?', [uid], (err, result) => {
        done(err, result[0]);
    });
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    }, (username, password, done) => {
        if (!username || !password) return done(null, false);
        db.query('SELECT * FROM users WHERE username=? AND password=?', [username, password], (err, result) => {
            if (err || !result.length) done(err, false);
            return done(null, result[0]);
        });
    }
));

module.exports = passport;