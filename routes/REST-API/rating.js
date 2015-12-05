var router = require('express').Router();
var Rating = require('../../models/rating');
var sanitizer = require('sanitizer');


//Create a rating for a posting with specified pid
router.post("/postings/:pid/ratings", validateFields, function(req, res){
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

    //Save the new rating into our database
    newRating.save(function(err, rating){
        if (err)
            res.send(err);
        res.json(rating);
    });
});

//Get ratings for a posting with pid
router.get("/postings/:pid/ratings", function(req, res){
    Rating.find({postingID:req.params.pid}, function(err, ratings){
        if (err)
            res.send(err);
        res.json(ratings);
    });
});


//Get all ratings
router.get("/ratings", function(req, res){
    Rating.find({}, function(err, ratings){
        if (err)
            res.send(err);
        res.json(ratings);
    });
});

module.exports = router;

//Validate fields in req.body (the input form) to prevent XSS Attacks
function validateFields(req, res, next){
    var flag = false;
    //Check if there are any fields whose value after sanitizing is different from original
    //If there is, then it is an indication that the original field is invalid
    for (var field in req.body){
        if (req.body[field] != sanitizer.sanitize(req.body[field])){
            flag = true;
        }
    }   
    console.log(flag);
    if (flag == true){
        res.json({ error: "invalid input! Try again."});

    }else{
        next();       
    }
}