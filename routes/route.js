// load up the user model
var User = require('../models/user');

module.exports=function(app, passport){

    //These serves the html pages (using EJS templates)
    //These html pages are dynamic, their content depends on whether a user is logged in or not
    //We pass these data on res.render() to modify the content accordingly. 
	app.get("/", function(req, res){
		res.redirect("/home.html");
	});

	app.get("/home.html", function(req, res){
        var data = getData(req);
		res.render("home.ejs", data);
	});

	app.get("/about-us.html", function(req, res){
        var data = getData(req);
		res.render("about-us.ejs", data);
	});

	app.get("/login.html", function(req, res){
        //If a user is currently logged in, there is no reason to login again
        //redirect to profile page
        if (req.isAuthenticated()){
            res.redirect("/profile.html");
        }else{
            var data = getData(req);
            //Pass in some message if any, this loginMessage comes from passport.js
            data.loginMessage=req.flash('loginMessage');
		    res.render("login.ejs", data);  
        }  
	});

	app.get("/signup.html", function(req, res){
        //If a user is currently logged in, there is no reason to signup
        //One must logged out first before signing up
        //redirect to profile page
        if (req.isAuthenticated()){
            res.redirect("/profile.html");
        }else{
            var data = getData(req);
            //Pass in some message if any, this loginMessage comes from passport.js
            data.signupMessage=req.flash('signupMessage');
		    res.render('signup.ejs', data);
        }
	});

	app.get("/search-books.html", function(req, res){
        var data = getData(req);
		res.render("search-books.ejs", data);
	});

    app.get('/profile.html', isLoggedIn, function(req, res){
        return res.redirect('/users/' + req.user.id + "/profile.html");
    });

	app.get('/users/:id/profile.html', isLoggedIn, function(req, res) {
        var data = getData(req);
        console.log(req.query);
        res.render('profile.ejs', data);
    });



    //These are the APIs for login and logout
    app.get('/logout', function(req, res){
        //After logging out, redirect user to login page
    	req.logout();
    	res.redirect("/login.html");
    });

	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile.html', // redirect to the profile section if login success
        failureRedirect : '/login.html', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile.html', // redirect to the profile section if signup success
        failureRedirect : '/signup.html', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


     // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/profile.html',
                failureRedirect : '/'
        })
    );




}



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated (logged in) in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


//Get some data about whether a user is currently logged in, and if so, which user is logged in
function getData(req){
    var data = {authenticated: "false"}
    if (req.isAuthenticated()){
        data = {authenticated: "true", user: req.user};
    }
    return data;
}