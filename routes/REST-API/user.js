var router = require('express').Router();
var User = require('../../models/user');


//Returns a list of users
router.get("/users", function(req, res){
    User.find({}, function(err, users) {
        // if there are any errors, return the error before anything else
        if (err)
            res.send(err);
        res.json(users);    
    });

});


//Get a particular user with id
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            res.send(err);
        res.json(user);    
    });
});


//Update a particular user with id
router.put("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            res.send(err);

        //User can only change their usename if their account type is local
        //If the accont type is google, they should change username and password on
        //Google's website, not here.
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

module.exports = router;