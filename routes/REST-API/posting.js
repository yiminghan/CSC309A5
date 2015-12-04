var router = require('express').Router();
var Posting = require('../../models/posting');

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
router.put("/postings/:id", function(req, res){
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