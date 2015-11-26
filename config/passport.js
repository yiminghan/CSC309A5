var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');


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
                            var type="user";
                            if (count == 0){
                                type="admin"
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
                                    newUser.type=type;
                                    newUser.username=req.body.username;
                                    // set the user's local credentials
                                    newUser.local.email    = email;
                                    newUser.local.password = password;

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

};