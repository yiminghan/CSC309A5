var User = require('../models/user');
var Book = require('../models/book');
var Posting = require('../models/posting');

module.exports=function(app){

	//All these APIs return in JSON format


    //Returns a list of books
    app.get("/api/books", function(req, res){
        Book.find({}, function(err, books) {
            // if there are any errors, return the error before anything else
            if (err)
                res.send(err);
            res.json(books);    
        });

    });


     //Returns a list of postings
    app.get("/api/postings", function(req, res){
        Posting.find({}, function(err, postings) {
            // if there are any errors, return the error before anything else
            if (err)
                res.send(err);
            res.json(postings);    
        });

    });

	//Returns a list of users
	app.get("/api/users", function(req, res){
		User.find({}, function(err, users) {
            // if there are any errors, return the error before anything else
            if (err)
                res.send(err);
            res.json(users);    
        });

	});


	//Get a particular user with id
	app.get("/api/users/:id", function(req, res){
		User.findById(req.params.id, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                res.send(err);
            res.json(user);    
        });
	});


    app.delete("/api/postings/:id", function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            if (err)
                res.send(err);
            res.json(posting);
        })
    });


    //Update a particular user with id
    app.put("/api/users/:id", function(req, res){
        console.log("abc");
        User.findById(req.params.id, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                res.send(err);
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
                    res.json(user)  
                }
            });
        });
    });
}