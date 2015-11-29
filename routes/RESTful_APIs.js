var User = require('../models/user');
var Book = require('../models/book');
var Posting = require('../models/posting');
var Rating = require('../models/rating');

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

    app.delete("/api/postings/:id", function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            if (err)
                res.send(err);
            res.json(posting);
        })
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

    app.put("/api/postings/:id", function(req, res){
        Posting.findById(req.params.id, function(err, posting){
            console.log(posting);
            console.log(req.body.availability);
            if (err)
                res.send(err);
            if (req.body.availability){
                posting.availability = req.body.availability;
            }

            posting.save(function(err){
                if (err)
                    res.send(err);
                res.json(posting);  
            });
        });
    });

    //Create a rating for a posting with pid
    app.post("/api/postings/:pid/ratings", function(req, res){
        var newRating = new Rating();
        newRating.postingID = req.params.pid;
        if (req.body.heading){
            newRating.heading = req.body.heading;
        }
        if (req.body.raterID){
            newRating.raterID = req.body.raterID;
        }
        if (req.body.raterName){
            newRating.raterName = req.body.raterName;
        }
        if (req.body.comment){
            newRating.comment = req.body.comment;
        }
        if (req.body.rating){
            newRating.rating = req.body.rating;
        }

        newRating.save(function(err, rating){
            if (err)
                res.send(err);
            res.json(rating);
        });
    });

    //Get ratings for a posting with pid
    app.get("/api/postings/:pid/ratings", function(req, res){
        Rating.find({postingID:req.params.pid}, function(err, ratings){
            if (err)
                res.send(err);
            res.json(ratings);
        });
    });
}