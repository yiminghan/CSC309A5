var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// load the auth variables
var configAuth = require('./auth');

// load up the user model
var User = require('../models/user');

var sanitizer = require('sanitizer');




module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //Define the login process
    passport.use(
        'local-login', 
        new LocalStrategy(
            {
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) { // callback with email and password from our form
                //Prevents Xss attacks, checks if input is valid
                if (email != sanitizer.sanitize(email) || password != sanitizer.sanitize(password)){
                    return done(null, false, req.flash("loginMessage", "Invalid input"));
                }
                                
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne(
                    { 'local.email' :  email },

                    function(err, user) {
                        // if there are any errors, return the error before anything else
                        if (err)
                            return done(err);

                        // if no user is found, return the message
                        if (!user)
                            return done(null, false, req.flash("loginMessage", "User not found")); // req.flash is the way to set flashdata using connect-flash

                        // if the user is found but the password is wrong
                        if (!user.validPassword(password))
                            return done(null, false, req.flash("loginMessage", "Password is wrong")); // create the loginMessage and save it to session as flashdata

                        // all is well, return successful user
                        return done(null, user);
                    }
                );
            }
        )
    );





    //Define the process during a signup
    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) {
                //Prevents Xss attacks, checks if input is valid
                if (email != sanitizer.sanitize(email) || password != sanitizer.sanitize(password)
                    || req.body.username != sanitizer.sanitize(req.body.username)){
                    return done(null, false, req.flash("signupMessage", "Invalid input"));
                }
                
                if (password != req.body.confirmPassword){
                    return done(null, false, req.flash('signupMessage', "Passwords do not match!"));
                }
                else{
                    // asynchronous
                    // User.findOne wont fire unless data is sent back
                    process.nextTick(function() {

                        //See how many users there are in the database to determine if this is the first user
                        User.count({}, function(err, count){
                            //The first user is admin
                            var userType="user";
                            if (count == 0){
                                userType="admin"
                            }

                            // find a user whose email is the same as the forms email
                            User.findOne({ 'local.email' :  email }, function(err, user) {
                                // if there are any errors, return the error
                                if (err)
                                    return done(err);

                                // check to see if theres already a user with that email
                                if (user) {
                                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                                } else {

                                    // if there is no user with that email
                                    // create the user
                                    var newUser = new User();
                                    newUser.accountType="local";
                                    newUser.userType=userType;
                                    newUser.imgPath = "/avatar/default.png";

                                    //default field
                                    newUser.description = "no description";
                                    newUser.phone = "N/A";
                                    // set the user's local credentials
                                    newUser.local.username= req.body.username;
                                    newUser.local.email    = email;
                                    //newUser.local.password = password;
                                    newUser.local.password = newUser.generateHash(password);

                                    // save the user
                                    newUser.save(function(err) {
                                        if (err)
                                            throw err;
                                        return done(null, newUser);
                                    });
                                }

                            });      
                        });

                    });
                    
                }

            }
        )
    );


    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            //See how many users there are in the database to determine if this is the first user
            User.count({}, function(err, count){
                //The first user is admin
                var userType="user";
                if (count == 0){
                    userType="admin"
                }
                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();
                        newUser.accountType="google";
                        newUser.userType=userType;
                        newUser.imgPath = "/avatar/default.png";

                        //default fields
                        newUser.description = "no description";
                        newUser.phone = "N/A";
                        // set all of the relevant information
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        });

    }));

};

