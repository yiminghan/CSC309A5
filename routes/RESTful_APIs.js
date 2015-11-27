var User = require('../models/user');

module.exports=function(app){

	//All these APIs return in JSON format


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
}