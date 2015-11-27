var User = require('../models/user');

module.exports=function(app){

	//All these APIs return in JSON format


	//Returns a list of users
	app.get("/api/users", function(req, res){

	});


	//Get a particular user with id
	app.get("/api/users/:id", function(req, res){

	});
}