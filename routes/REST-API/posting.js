var router = require('express').Router();
var Posting = require('../../models/posting');
var sanitizer = require('sanitizer');

//Delete a posting with specified id
router.delete("/postings/:id", function(req, res){
    Posting.findById(req.params.id, function(err, posting){
        if (err)
            res.send(err);
        res.json(posting);
    })
});

 //Returns a list of postings
router.get("/postings", function(req, res){
    Posting.find({}, function(err, postings) {
        // if there are any errors, return the error before anything else
        if (err)
            res.send(err);
        res.json(postings);    
    });

});

//Update a posting with specified id
router.put("/postings/:id", validateFields, function(req, res){
    Posting.findById(req.params.id, function(err, posting){
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
    if (flag == true){
        res.json({ error: "invalid input! Try again."});

    }else{
        next();       
    }
}