// load up the  models
var User = require('../models/user');
var Book = require('../models/book');
var Posting = require('../models/posting');
var Rating = require('../models/rating');



module.exports=function(app, passport){
    //These serves the html pages (using EJS templates)
    //These html pages are dynamic, their content depends on whether a user is logged in or not
    //We pass these data on res.render() to modify the content accordingly. 
	app.get("/", function(req, res){
		res.redirect("/home.html");
	});

	app.get("/home.html", function(req, res){
        var data = getData(req);
        data.tab = "home";
		res.render("home.ejs", data);
	});

	app.get("/about-us.html", function(req, res){
        var data = getData(req);
        data.tab = "about-us";
		res.render("about-us.ejs", data);
	});

    app.get("/view-users.html", function(req, res){
        //Only admin can monitor users
        if (req.isAuthenticated()){
            User.find({}, function(err, users) {
                // if there are any errors, return the error before anything else
                if (err)
                    res.send(err);
                var data=getData(req);
                data.userList = users;
                data.tab = "view-users";
                res.render('user-list.ejs', data);    
            });
        }else{
            res.redirect("/");
        }
    });

	app.get("/search-postings.html", isLoggedIn, function(req, res){
        
        Posting.find({}, function(err, postings){
            if (err){
                res.send(err);
            }
            var data = getData(req);
            data.tab = "search-postings";
            data.postingList = postings;
    		res.render("posting-list.ejs", data);
            
        });
	});

    
    app.get("/create-posting.html", function(req, res){
        //Only user can post a book
        if (req.isAuthenticated() && req.user.userType == "user"){
            var data = getData(req);
            data.tab="create-posting";
            res.render("create-posting.ejs", data);
        }else{
            res.redirect('/');
        }
    });


    app.post("/create-posting", function(req, res){
        //Only user can post a book
        if (req.isAuthenticated() && req.user.userType == "user"){
            var newPosting = new Posting();
            newPosting.ISBN = req.body.ISBN;
            newPosting.bookTitle = req.body.bookTitle;
            newPosting.postingTitle = req.body.postingTitle;
            newPosting.authors = req.body.authors;
            newPosting.ownerID = req.user.id;
            newPosting.description= req.body.description;
            newPosting.price = req.body.price;
            newPosting.field = req.body.field;
            newPosting.availability = "true";

            if (req.user.accountType == "google"){
                newPosting.ownerName = req.user.google.name;
            }else{
                newPosting.ownerName = req.user.local.username;
            }

            newPosting.save(function(err) {
                if (err)
                    throw err;
                else{
                    res.redirect('/my-profile.html');
                }
            });
        }else{
            res.redirect('/');
        }
    });

    app.get("/users/:id/postings.html", isLoggedIn, function(req, res){
        if (req.params.id == req.user.id){
            Posting.find({ownerID: req.user.id}, function(err, postings){
                var data = getData(req);
                data.postingList = postings;
                data.tab = "my-postings";
                res.render("posting-list.ejs", data);
            });
        }
    });

    app.get("/users/:uid/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            res.redirect("/users/"+req.params.uid+"/postings.html");
        });
    });

    app.get("/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            res.redirect("/search-postings.html");
        });
    });


    app.get("/postings/:id/details.html", isLoggedIn, function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            if (err)
                res.send(err);

            Posting.find({field:posting.field}, function(err, recommendations){
                if(posting.ownerID == req.user.id){
                    var data = getData(req);
                    data.posting = posting;
                    data.recommendations = recommendations;
                    data.tab = "my-postings";
                    res.render("my-posting-details.ejs", data);
                }else{
                    var data = getData(req);
                    data.posting = posting;
                    data.recommendations = recommendations;
                    data.tab = "search-postings";
                    res.render("posting-details.ejs", data);
                }
            });
        });
    });

    app.get("/postings/:id/make-available", isLoggedIn, function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            posting.availability = "true";
            posting.save(function(err){
                if (err)
                    res.send(err);
                res.redirect('back');
            });
        });
    });

    app.get("/postings/:id/make-unavailable", isLoggedIn, function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            posting.availability = "false";
            posting.save(function(err){
                if (err)
                    res.send(err);
                res.redirect('back');
            });
        });
    });


    app.get("/login.html", function(req, res){
        //If a user is currently logged in, there is no reason to login again
        //redirect to profile page
        if (req.isAuthenticated()){
            res.redirect("/my-profile.html");
        }else{
            var data = getData(req);
            data.tab = "login";
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
            res.redirect("/my-profile.html");
        }else{
            var data = getData(req);
            data.tab = "signup";
            //Pass in some message if any, this loginMessage comes from passport.js
            data.signupMessage=req.flash('signupMessage');
            res.render('signup.ejs', data);
        }
    });


    app.get('/my-profile.html', isLoggedIn, function(req, res){
        return res.redirect('/users/' + req.user.id + "/profile.html");
    });

	app.get('/users/:id/profile.html', isLoggedIn, function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is viewing his own profile
        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            res.render('my-profile.ejs', data);        
        }
        //If the user is viewing other users' profile
        else{
            User.findById(req.params.id, function(err, selectedUser) {
                    // if there are any errors, return the error before anything else
                    if (err)
                        res.send(err);

                    // if no user is found, return a message
                    if (!selectedUser)
                        res.json({message: "user with selected id not found"});

                    var data=getData(req);
                    data.selectedUser = selectedUser;
                    data.tab = "user-profile";
                    res.render("user-profile.ejs", data);
                    
                }
            );
        }
    });

    app.get('/users/:id/edit_profile.html', isLoggedIn, function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is editing his own profile
        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            res.render('edit-profile.ejs', data);        
        }
        //If the user is editing other users' profile
        else{
            User.findById(req.params.id, function(err, selectedUser) {
                    // if there are any errors, return the error before anything else
                    if (err)
                        res.send(err);

                    // if no user is found, return a message
                    if (!selectedUser)
                        res.json({message: "user with selected id not found"});

                    var data=getData(req);
                    data.selectedUser = selectedUser;
                    data.tab = "user-profile";
                    res.render("edit-profile.ejs", data);
                    
                }
            );
        }
    });


    app.post('/users/:id/edit', isLoggedIn, function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is editing his own profile
        //Also, a user can only edit his own profile, same with admin.
        if (req.user.id == req.params.id){
            var user = req.user;
            if (req.body.name && user.accountType =="local"){
                user.local.username = req.body.name;
            }
            if (req.body.password && user.accountType =="local"){
                user.local.password = req.body.password;
            }

            if (req.body.phone){
                user.phone = req.body.phone;
            }

            if (req.body.description){
                user.description = req.body.description;
            }

            user.save(function(err){
                if (err){
                    res.send(err);
                }else{
                    res.redirect("/users/" + user.id + "/profile.html");  
                }
            });       
        }else{
            res.redirect("/");
        }
    });


    app.get('/users/:id/remove', isLoggedIn, function(req, res){
        
        if (req.user.userType=="admin"){
            User.remove({_id:req.params.id}, function(err, data){
                if (err){res.send(err);}
                else{
                    res.redirect("/view-users.html");
                }
            });
        }else{
            res.redirect("/my-profile.html");
        }
    });


    //These are the APIs for login and logout
    app.get('/logout', function(req, res){
        //After logging out, redirect user to login page
    	req.logout();
    	res.redirect("/login.html");
    });

	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/my-profile.html', // redirect to the profile section if login success
        failureRedirect : '/login.html', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/my-profile.html', // redirect to the profile section if signup success
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
                successRedirect : '/my-profile.html',
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