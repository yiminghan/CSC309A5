var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
	next(); // pass control to the next handler
});

//Serves the static files
var staticFolder = path.join(__dirname,"static");
app.use(express.static(path.join(staticFolder,"image")));
app.use(express.static(path.join(staticFolder,"css")));
app.use(express.static(path.join(staticFolder,"html")));
app.use(express.static(path.join(staticFolder,"js")));
app.use(express.static(staticFolder));

//Connect to the database
var mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1/csc309-a4');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("connected")
});

var Schema = mongoose.Schema;

//A schema for a behavior belong to a user. A behavior is recorded when a user is logged in.
var behaviorSchema = new Schema({
	logged_in_date: String,
	ip_addr: String,
	device_width:String,
	device_height: String
});


//A schema representing an user
var userSchema = new Schema({
	email: String,  //Unique to every, this serves as the ID
	password: String, 
	description: String, //A description about this user
	profile_pic: String, //A profile picture, user can select profile pic: "1" or "2"
	display_name: String, //A display name
	type: String, //The type of this user, it is either: "user", "admin", or "super admin"
	behaviors:[behaviorSchema] //An array of behaviors belonging to this user
});

var User = mongoose.model("User", userSchema);

//Serves the index html file
app.get("/", function(req, res){
	res.render('index.html');
});


//API calls and handling

//Retrieve all behaviors belong to a user with user_id
app.post("/api/users/:user_id/behaviors", function(req, res){
	//Finds the user with the specified ID (email)
	User.findOne({email:req.params.user_id}, function(err, user){
		if (err){
			console.log(err);
			res.send(err);
		}else{
			//Sends 404 Not Found if the user is not found
			if (user == null){res.sendStatus(404);}
			else{
				//Push a new behavior to this user
				user.behaviors.push({
					logged_in_date:req.body.date,
					ip_addr:req.body.ip,
					device_height:req.body.device_height,
					device_width:req.body.device_width
				});

				user.save(function(err){
					if (err){
						res.send(err);
					}else{
						res.json(user)	
					}
				});
			}
		}
	})
});

//Get all behaviors belonging to the user with user_id
app.get("/api/users/:user_id/behaviors", function(req, res){
	//Find the user
	User.findOne({email:req.params.user_id}, function(err, user){
		if (err){
			console.log(err);
			res.send(err);
		}else{
			//Send status 404 if the user is not found
			if(user == null){res.sendStatus(404);}
			else{res.json(user.behaviors)};
		}
	})
});


// Update a particular user with user_id
app.put("/api/users/:user_id", function(req, res){
	//Attempt to find the user with the corresponding id(email)
	User.findOne({email:req.params.user_id}, function(err, user){
		if (err){
			console.log(err);
			res.send(err);
		}else{
			//Send status 404 if the user is not found
			if(user == null){res.sendStatus(404);}
			else{
				// update any non-null fields
				var description = req.body.description;
				var password = req.body.password;
				var display_name = req.body.display_name;
				var profile_pic = req.body.profile_pic;
				var type = req.body.type;

				if (description != null){
					user.description = description;
				}

				if (password != null){
					user.password = password;
				}

				if (profile_pic != null){
					user.profile_pic = profile_pic;
				}

				if (display_name != null){
					user.display_name = display_name;
				}

				if (type != null){
					user.type = type;
				}
				
				user.save(function(err){
					if (err){
						res.send(err);
					}else{
						res.json(user)	
					}
				});
			};
		}
	});
});

//Create a new user, fields are provided in the request HTTP body
app.post("/api/users", function(req, res){
	var email = req.body.email;
	var password = req.body.password;

	//Count the number of users with the same email to see if this user already exists
	User.count({ email:email }, function(err, count){
		if (err){res.send(err);}
		if (count != 0){
			//Send 409 if this user already exists
			res.sendStatus(409);
		}else{
			//See how many users there are in the database to determine if this is the first user
			User.count({}, function(err, count){
				if (err){res.send(err);}
				else{
					var type;

					if (count == 0){
						//If this is the first user,  then his user type is "super admin"
						type = "super admin";
					}
					else{
						//Otherwise, this is just a normal user
						type = "user";
					}
					
					var user = new User({
						email:email,
						password:password,
						description: "", //default description
					 	display_name: email, //default display_name, same as email
					 	profile_pic: "1", //default profile_pic
						behaviors: [],
						type: type
					});

					user.save(function(err){
						if (err){
							res.send(err);
						}
						res.json({email: email,
						 	password: password,
						 	description: "", //default description
						 	display_name: email, //default display_name, same as email
						 	profile_pic: "1", //default profile_pic });
							behaviors: [],
							type: type
						});
					});
				}
			});

		}
	});
});

//Get a user using its id: its id in this case is its email
app.get("/api/users/:user_id", function(req, res){
	//Attempt to find the user with the corresponding id(email)
	User.findOne({email:req.params.user_id}, function(err, user){
		if (err){
			console.log(err);
			res.send(err);
		}else{
			//Send status 404 if the user is not found
			if(user == null){res.sendStatus(404);}
			else{res.json(user)};
		}
	});
});

//Get all users in the database
app.get("/api/users", function(req, res){
	User.find({}, function(err, users){
		if (err){
			console.log(err);
			res.send(err);
		}else{
			res.json(users);
		}
	});
});

//Delete a user with the specified user_id (email)
app.delete("/api/users/:user_id", function(req, res){
	User.remove({email:req.params.user_id}, function(err, data){
		if (err){res.send(err);}
		else{
			if (JSON.parse(data).n == "0"){
				//if 0 items are removed, ie, this user doesn't exist, return 404 Not Found
				res.sendStatus(404);
			}else{
				res.send();
			}
		}
	});
});



app.listen(3000);

