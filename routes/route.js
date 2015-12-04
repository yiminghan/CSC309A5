// load up the  models
var User = require('../models/user');
var Posting = require('../models/posting');
var Rating = require('../models/rating');
var Message = require('../models/message');

var multer  = require('multer')
var upload = multer({ dest: 'static/avatar/' })
var fs = require("fs");
var path = require("path");



module.exports=function(app, passport){
    //These serves the html pages (using EJS templates)
    //These html pages are dynamic, their content depends on whether a user is logged in or not
    //We pass these data on res.render() to modify the content accordingly. 
    //A data JSON object is passed into the EJS template using res.render on almost every route
    //data contains information about the currently logged in user and some other information
    //data.tab contains a string indicating the EJS template which tab should be highlighted

    //Some routes can only be reached under some circumstances, for instance, 
    //"/view-user.html" can only be reached when a user is logged in. If a user is not
    //logged in and attempts to enter this url, he will be redirected to the home page.
    //The isLoggedIn middleware function handles this condition. Similarly, there
    // are other middleware functions such as isNotLoggedIn, isUser, isAdmin.

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

    //This page shows all users in the system. Must be logged in to view.
    app.get("/view-users.html", isLoggedIn, function(req, res){
        //Find all users
        User.find({}, function(err, users) {
            if (err)
                res.send(err);

            var data=getData(req);
            //Pass in to EJS the list of users to display
            data.userList = users;
            data.tab = "view-users";
            res.render('user-list.ejs', data);    
        });
    });

    //This page shows all postings in the system. Must be logged in to view.
	app.get("/search-postings.html", isLoggedIn, function(req, res){
        //Find all postings
        Posting.find({}, function(err, postings){
            if (err){
                res.send(err);
            }
            var data = getData(req);
            data.tab = "search-postings";
            //Pass in to EJS the list of postings to display
            data.postingList = postings;
    		res.render("posting-list.ejs", data);
            
        });
	});

    //The login page. User must be logged out to view this page
    app.get("/login.html", isNotLoggedIn, function(req, res){
        var data = getData(req);
        data.tab = "login";
        //Pass in some message if any, this loginMessage comes from passport.js
        data.loginMessage=req.flash('loginMessage');
        res.render("login.ejs", data);  
        
    });

    //The signup page. User must be logged out to view this page
    app.get("/signup.html", isNotLoggedIn, function(req, res){
        var data = getData(req);
        data.tab = "signup";
        //Pass in some message if any, this loginMessage comes from passport.js
        data.signupMessage=req.flash('signupMessage');
        res.render('signup.ejs', data);
        
    });

    //A page for viewing a logged in user's own profile. Must be logged in.
    app.get('/my-profile.html', isLoggedIn, function(req, res){
        return res.redirect('/users/' + req.user.id + "/profile.html");
    });

    //A page for viewing a particular user's profile. Must be logged in.
    app.get('/users/:id/profile.html', isLoggedIn, function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is viewing his own profile
        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            //Render the my-profile page
            res.render('my-profile.ejs', data);        
        }
        //If the user is viewing other users' profile
        else{
            //Find the selected user first
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
                    //Render the "user=profile" page
                    //Notice "my-profile" is the page used for viewing one's own profile
                    //"user-profile" is the page used for viewing other user's profile
                    res.render("user-profile.ejs", data);
                }
            );
        }
    });

    //Serves the edit profile page for a particular user with specified id. Must be logged in.
    //User can only edit their own profile, including admin.
    app.get('/users/:id/edit_profile.html', isLoggedIn, function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is editing his own profile
        if (req.user.id == req.params.id){
            var data=getData(req);
            data.tab = "my-profile";
            data.passwordMessage = req.flash("passwordMessage");
            res.render('edit-profile.ejs', data);        
        }

        else{
            res.redirect("/my-profile.html");
        }
    });

    app.get("/user/:id/messages", isLoggedIn, function(req, res){
        //User can only view their own inbox
        if (req.user.id == req.params.id){
            var data = getData(req);
            data.tab = "inbox";
            res.render("inbox.ejs", data);
        }else{
            res.redirect("/my-profile");
        }
    });

    app.get("/create-posting.html", isLoggedIn, isUser, function(req, res){
        var data = getData(req);
        data.tab="create-posting";
        res.render("create-posting.ejs", data);
    });


    app.post("/create-posting", isLoggedIn, isUser, function(req, res){
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

    });

    //Returns the postings page for a particular user. This page shows
    //all postings a particular user has so far
    app.get("/users/:id/postings.html", isLoggedIn, function(req, res){
        //User can only view their own postings
        if (req.params.id == req.user.id){
            Posting.find({ownerID: req.user.id}, function(err, postings){
                var data = getData(req);
                data.postingList = postings;
                data.tab = "my-postings";
                res.render("posting-list.ejs", data);
            });
        }
    });

    //Remove a posting. Also remove the ratings attached to that posting
    app.get("/users/:uid/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            Rating.remove({postingID:req.params.pid}, function(err, ratings){
                if (err)
                    res.send(err);
                res.redirect("/users/"+req.params.uid+"/postings.html");
            });
        });
    });

    app.get("/postings/:pid/delete", isLoggedIn, function(req, res){
        Posting.remove({_id:req.params.pid}, function(err, posting){
            if (err)
                res.send(err);
            Rating.remove({postingID:req.params.pid}, function(err, ratings){
                if (err)
                    res.send(err);
                res.redirect("/search-postings.html");
            });
        });
    });


    app.get("/postings/:id/details.html", isLoggedIn, function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            if (err)
                res.send(err);

            Posting
            .find({field:posting.field, _id: {$ne : posting.id}}, 
            function(err, recommendations){
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

   

    app.post('/users/:id/edit', isLoggedIn, upload.single("img"), function(req, res) {
        //If the requested profile belongs to the authenticated user
        //Ie. the user is editing his own profile
        //Also, a user can only edit his own profile, same with admin.
        if (req.user.id == req.params.id){
            var user = req.user;

            if (req.file){
                //Delete old profile picture, unless the old profile picture is default
                if (user.imgPath != "/avatar/default.png"){
                    fs.unlink(path.join(__dirname, ".." , "static", user.imgPath), function(err) {
                    });
                }
                user.imgPath = "/avatar/" + req.file.filename;
            }
            if (req.body.name && user.accountType =="local"){
                user.local.username = req.body.name;
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


    app.post('/users/:id/change-password', isLoggedIn, function(req, res){
        if (req.user.id == req.params.id){
            var user = req.user;
            console.log(req.body.oldPassword);
            console.log(req.body.newPassword);
            if (req.body.newPassword && user.accountType =="local"){
                if (user.validPassword(req.body.oldPassword)){
                    //Encrypt password and store into database
                    user.local.password = user.generateHash(req.body.newPassword);
                    user.save(function(err){
                        if (err){
                            res.send(err);
                        }
                        res.redirect("/users/" + user.id + "/profile.html");  
                        
                    });       
                }else{
                    req.flash("passwordMessage", "Incorrect (old) password!");
                    res.redirect("/users/" + user.id + "/edit_profile.html")
                }
            }
        }else{
            res.redirect("/");
        }
        
    });


    //To delete a user, we need to delete the User itself, the user's postings,
    //All ratings on that user's postings, and all messages from and to that user
    app.get('/users/:id/remove', isLoggedIn, isAdmin, function(req, res){
        Message.remove(
            {$or:[{messengerID: req.params.id}, {receiverID : req.params.id}]}
            , function(err, messages){
            if (err)
                res.send(err);

            Posting.find({ownerID:req.params.id}, function(err, postings){
                if (err)
                        res.send(err);
                var postingList = [];
                for (var i = 0; i<postings.length; i++){
                    postingList.push(postings[i].id);
                }
                Posting.remove({ownerID:req.params.id}, function(err, result){
                    if (err)
                            res.send(err);

                    Rating.remove({postingID: {$in: postingList }}, function(err, user){
                        if (err)
                            res,send(err);
                        User.remove({_id: req.params.id}, function(err, user){
                            if (err)
                                res.send(err);
                            res.redirect("/view-users.html");     
                        });
                    });

                });
                
            });

        });
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

// route middleware to check if a user is not logged in
function isNotLoggedIn(req, res, next){
    //If the user ia not logged, in move on
    if (!req.isAuthenticated()){
        return next();
    }

    //If the user is already logged in, move to their profile page
    res.redirect("/my-profile.html");
}


//Get some data about whether a user is currently logged in, and if so, which user is logged in
function getData(req){
    var data = {authenticated: "false"}
    if (req.isAuthenticated()){
        data = {authenticated: "true", user: req.user};
    }
    return data;
}


function isUser(req, res, next){
    if (req.user.userType == "user"){
        return next();
    }

    res.redirect("/my-profile.html");
}


function isAdmin(req, res, next){
    if (req.user.userType == "admin"){
        return next();
    }

    res.redirect("/my-profile.html");
}