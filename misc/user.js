var express = require('express'); 
var router = express.Router(); 
var mongoose = require('mongoose');
var session = require('express-session');
var methodOverride = require('method-override');
var multiparty = require('multiparty');

// Keep track of the number of users and the number of ratings 
var usercount;
var ratingcount;

// NOT SURE IF WE NEED THIS 
// Parses x-ww-form-urlencoded request bodies from web forms
router.use(bodyParser.urlencoded({extended : true})) 

// NOT SURE IF WE NEED THIS ANYMORE
/* Simulating more than GET/POST requests from web forms
router.use(methodOverride(function (req, res){
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		var method = req.body._method
		delete req.body._method
		return method
	}
}))
*/ 

router.use(session({
  secret: 'qwerty123456789',
  resave: false,
  saveUninitialized: false,
}))

router.use(function(req, res, next){ 
	req.session.views = (req.session.views || 0) + 1;
	next();
})

//build the REST operations at the base for users
router.route('/')
    .get(function(req, res, next) {
	var data = {authenticated : "false"};
	// If there was a previous session stored via passport 
	if (data.isauthenticated() {
		data = {authenticated : "true", user : req.user};
	}

	if (data.authenticated == "true") {
 		mongoose.model('User').find({}, function (err, users) {
			if (err) {
	        	return console.error(err);
	        } 
	        else {
				mongoose.model('User').findOne({user : data.user._id},function(err, person){
			    	if (person) {
			    	// TODO: Modify this part to work for new front end
			      		res.format({ 

			      			html: function(){
	                    	res.render('users/index', {
					  			title: 'All my users',
					  			"user" : person,
					  			"users" : users});
	                   		 },

	                    	json: function(){
	                        	res.json(users);
	                    	}
	                    });
			      	}
			    	else {
				  		// TODO: front end res.render for index page
			      	}
			  	});
		     }
    	});
	}
	else {
	    // TODO: Front end res.render for index page 
		}
    })

    .post(function(req, res) {
   	var data = {authenticated : 'false'};
   	if (req.isAuthenticated()) {
   		data.authenticated = {authenticated : "true", user : req.user};
   	}

   	if (data.authenticated == "true") {
		mongoose.model('User').findOne({email data.user.local.email}, function(err, user) {
		    if(err){
			console.log('GET Error: There was a problem retrieving: '+err);
		    }
		    // Create user if a user with that email does not exist 
		    if (!user) {
		    var form = multiparty.Form();
		    form.parse(req, function(err, fields, files) {
			    var fname = req.body.fname;
				var lname = req.body.lname;
				var email = req.body.email;
				var dob = req.body.dob;
				var ownerRating = 0;
				var borrowerRating = 0;
				var password = req.body.password;
				var description = "No Description Yet! Tell this person to write something!";
				var adminRights = false;
				var userId = usercount++;
				mongoose.model('User').find({}, function (err, results) {
					console.log(results);
				    // If the user is the first user make them an admin 
				    if (!results.length) {
					adminRights = true;
				}
				
				console.log("Admin Rights for this person is: " + admin);			    
				//call the create function for our database
				mongoose.model('User').create({
				    Fname : fname,
				    Lname : lname,
				    email : email,
				    password : password,
				    dob : dob,
				    ownerRating : ownerRating,
				    borrowerRating : borrowerRating,
				    description : description,
				    adminRights : adminRights,
				    views : 0 // Not sure what this is for?
				}, function (err, luser) {
					if (err) {
						res.send("There was a problem adding the information to the database.");
				    } 
				    else {
					 	mongoose.model('User').find({}, function (err, users) {
			              if (err) {
			                  return console.error(err);
			              } else {
					  			sess = req.session;
					  			sess.email = req.body.email;
					  			// TODO: Update this for the new frontend
			                  	res.format({
			                    	html: function(){
			                        	res.render('users/index', {
			                            	title: 'All my users',
						    				"user" : luser,
			                            	"users" : users
			                          	});
			                    	},
			                   		json: function(){
			                        	res.json(users);
			                    	}
			                  	});
			                }
				 		});
				    }
					});
				});
		    });

		    } else if (user) {
		    // TODO: Update this for the new front-end
		   	// Render the front end for if the e-mail for a new user is already in use
			res.render('users/new',{ success: false, message: 'Email already in-use!' });
		    }
		});
	}
	else {
		res.json({success: 0, message : "login failed"});
	}
});

// Static Content load
/* GET New User Model. */
router.get('/new', function(req, res) {
	// TODO: Update the front end to allow for getting new users
    res.render('users/new', { title: 'Add New User' });
});

router.get('/login', function(req, res){
	// TODO: Update this for the new frontend
    res.render('users/login', {success:true , message:""});
});

// Route middleware to validate a user's id
router.param('id', function(req, res, next, userid) {
    //console.log('validating ' + id + ' exists');
    mongoose.model('User').findById(userid, function (err, user) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(userid + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                 }
            });
        } else {
            // once validation is done save the new item in the req
            req.id = id;
            next(); 
        } 
    })});


router.post('/login', function(req,res) {
	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {
		mongoose.model('User').findOne({data.user.local.email}, function(err, user) {
			if(err){
			    console.log('GET Error: There was a problem retrieving: '+err);
			}
			if (!user) {
				// TODO: Update front end
			    res.render('users/login', { success: false, message: 'Authentication failed. User not found.' });
			} 
			else if (user) {
			    // check if password matches
			    if (user.password != fields.password) {
				res.render('users/login',{ success: false, message: 'Authentication failed. Wrong password.' });
			    } else {
				mongoose.model('User').find({}, function (err, users) {
				    if (err) {
					return console.error(err);
				    } else {
				   	// Commented out the session parts, not sure if should be removed
					//sess = req.session;
					//sess.email = req.body.email;

					// This part could be changed depending on front-end implementation
					res.format({
					    html: function(){
		                        res.render('users/index', {
		                            title: 'Welcome' + user.name,
					    			"user" :user,
		                            "users" : users
		                        });	
		                    },
						json: function(){
		                       res.json(users);
		                    }
		             });
		         	}     
				});}
			}
		}
 	}
	else {
		res.json({success: 0, message : "login failed"});
	}
)});

router.route('/:id')
  .get(function(req, res) {
  	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {

		mongoose.model('User').findById(data.user._id, function (err, user) {
		  if (err) {
		    console.log('GET Error: There was a problem retrieving: ' + err);
		  } else {
		 // var sess = req.session;
		  console.log('sess.email');
		  mongoose.model('User').findOne({data.user.local.email}, function(err, person){
		          console.log('GET Retrieving ID: ' + data.user._id);
		          res.format({
			  html: function(){
		          res.render('users/show', {
		              "user" : user,
			  "person" : person,
			  "rights" : person.admin
		          });
			  },
			  json: function(){
			      res.json(user);
			  }
		          });
		  });
		  }	
		});
 	}
	else {
		res.json({success: 0, message : "login failed"});
	}
 });


router.get('/:id/edit', function(req, res) {
  	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {
		mongoose.model('User').findById(data., function (err, user) {
		    if (err) {
		        console.log('GET Error: There was a problem retrieving: ' + err);
		    } else {
		    //var sess = req.session;
			    mongoose.model('User').findOne({data.local.email}, function(err, person){
				console.log('GET Retrieving ID: ' + data.user._id);

				// TODO : Make this work with the front end
				res.format({
			                //HTML response will render the 'edit.jade' template
			    	html: function(){
						res.render('users/edit', {
			            	title: 'UserID' + user._id,
			                "user" : user,
					    	"rights" : person.admin,
					    	"person" : person
						});
			        },
			                //JSON response will return the JSON output
			       	json: function(){
						res.json(user);
			        }
				});
			  });
			}
		});
 	}
	else {
		res.json({success: 0, message : "login failed"});
	}
});


router.put('/:id/edit', function(req, res) {
  	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {
		var form = multiparty.Form();
		form.parse(req, function(err, fields, files) {
			var fName = fields.fname;
			var lName = fields.lname;
			var password = fields.password;
			var description = fields.description;
			var admin = fields.admin;
		//find the document by ID
		    mongoose.model('User').findById(data.user._id, function (err, user) {
		        //update it
		        user.update({
		            name : name,
		            password : password,
		            description: description,
		            admin : admin
		        }, function (err, usert) {
			console.log(user);
		          if (err) {
		              res.send("There was a problem updating the information to the database: " + err);
		          } 
					else {
						// TODO: Update for the front end 
		                  res.format({
		                      html: function(){
		                           res.redirect("/users/" + data.user._id);
		                     },
		                     //JSON responds showing the updated values
		                    json: function(){
		                           res.json(user);
		                     }
		                  });
		           }
		        })
		   	});
		});
    }
	else {
		res.json({success: 0, message : "login failed"});
	}
});

// Route for updating a user's owner rating
// 
router.put('/:id/rate/:id2/owner', function(req, res) {
  	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {
		// Check if the first user exists (not sure if I should use session here)
		mongoose.model('User').findById(req.param.id, function (err, user) {
			if (err) {
				return console.log('GET error: There was a problem retrieving ' + err);
			}
			else {
				// Check if the second user exists 
				// Double check this part...
				mongoose.model('User').findById(req.param.id2, function(err, user2) {
					if (err) {
						return console.log('GET error: There was a problem retrieving ' + err);
					}
					else if (user1.local.username = user2.local.username) {
						return console.log("Cannot rate yourself");
					}
					else {
						// Create a new tuple for the ratings schema for user2 to add a rating/comment
						var form = new multiparty.Form();
						form.parse(req, function (err, fields, files) {
							var ratingID = ratingcount++;
							var userID = user2.userID; 
							var type = 'owner';
							var rating = fields.rating; // 
							var comment = fields.comment;
		  
							// Update user 1's  and number of ratings
							// is Req.ID guaranteed to be user 1's id?
							if (rating == 1) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {onestarOwner : 1}});
							}

							else if (rating == 2) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {twostarOwner : 1}});
							}

							else if (rating == 3) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {threestarOwner : 1}});

							}

							else if (rating == 4) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {fourstarOwner : 1}});

							}
							else {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {fivestarOwner : 1}});
							}
						
							// Exec callback
							query.exec(function (err, user) {
								if (err) {
									return console.log("Error, there was a problem updating the DB");
								}
								else {
									var newRating = ((onestarOwner * 1) + (twostarOwner * 2) + (threestarOwner * 3) 
										+ (fourstarOwner * 4) + (fivestarOwner * 5)) / (onestarOwner + twostarOwner
										+ threestarOwner + fourstarOwner + fivestarOwner);
									user.update({
										{avgratingOwner : newRating}
									});
								}
							})
							
							mongoose.model('ratings').create({
								ratingID : ratingID,
								userID : UserID,
								type : type,
								comment : comment,
								rating : rating
							}), function(err, rating) {
								if (err) {
									console.log(err);
									res.send("There was a problem adding to the user ratings DB");
								} else {
									//unsure if I need the temp variable like in book.js
									res.json({success: 1, rating : rating});

								}
							});
						});
					}
				});
			}
	 	});
	else {
		res.json({success: 0, message : "login failed"});
	}
});

// Route for updating a user's borrower rating
router.put('/:id/rate/:id2/owner', function(req, res) {
	var data = {authenticated : " false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "true") {
	// Check if the first user exists (not sure if I should use session here)
		mongoose.model('User').findById(req.param.id, function (err, user) {
			if (err) {
				return console.log('GET error: There was a problem retrieving ' + err);
			}
			else {
				// Check if the second user exists 
				// Double check this part...
				mongoose.model('User').findById(req.param.id2, function(err, user2) {
					if (err) {
						return console.log('GET error: There was a problem retrieving ' + err);
					}
					else {
						// Create a new tuple for the ratings schema for user2 to add a rating/comment
						var form = new multiparty.Form();
						form.parse(req, function(err, fields, files) {
							var ratingID = ratingcount++;
							var userID = user2.userID; 
							var type = 'borrower';
							var rating = fields.rating; // 
							var comment = fields.comment;

							// Update user 1's  and number of ratings
							// is Req.ID guaranteed to be user 1's id?
							if (rating == 1) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {onestarBorrow : 1}});
							}

							else if (rating == 2) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {twostarBorrow : 1}});
							}

							else if (rating == 3) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {threestarBorrow : 1}});

							}

							else if (rating == 4) {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {fourstarBorrow : 1}});

							}
							else {
								var query = mongoose.model('User').findByIdAndUpdate(data.user._id, 
									{$inc : {fivestarBorrow : 1}});
							}
						
							// Exec callback
							query.exec(function (err, user) {
								if (err) {
									return console.log("Error, there was a problem updating the DB");
								}
								else {
									var newRating = ((onestarBorrow * 1) + (twostarBorrow * 2) + (threestarOwner * 3) 
										+ (fourstarBorrow * 4) + (fivestarOwner * 5)) / (onestarOwner + twostarOwner
										+ threestarBorrow + fourstarBorrow + fivestarBorrow);
									user.update({
										{avgratingBorrow : newRating}
									});
								}
							})
							
							mongoose.model('ratings').create({
								ratingID : ratingID,
								userID : UserID,
								type : type,
								comment : comment,
								rating : rating
							}), function(err, rating) {
								if (err) {
									console.log(err);
									res.send("There was a problem adding to the user ratings DB");
								} else {
									//unsure if I need the temp variable like in book.js
									res.json({success: 1, rating : rating});

								}
							});
						});
					}
				});
			}
		});
	else {
		res.json({success: 0, message : "login failed"});
	}
});

router.delete('/users/:id', function (req, res){
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
		data = {authenticated : "true", user: req.user};
	}
	var admin = false;
	if (data.authenticated == "true"){
		if (data.user.userType == "admin") {
			admin = true;
		    console.log("admin permission");//Test logging
		}
	}
	if (admin) {
	    mongoose.model('User').findById(req.id, function (err, user) {
	        if (err) {
	            return console.error(err);
	        } 
	        else {
	            //remove it from Mongo
		    	var temp = user;
		    	//var sess = req.session;
		    	mongoose.model('User').findOne({user.local.email}, function(err, person){
					var isEq = (person == user);
					user.remove(function (err, userd) {
	                    	if (err) {
								return console.error(err);
	                    	} else {
							//Returning success messages saying it was deleted
								if(!isEq){
								    console.log('DELETE removing ID: ' + temp._id);
								    mongoose.model('User').find({}, function(err, users){
								    	// TODO : Convert to match new front end
										res.format({
											html: function(){
												res.render('users/index', {
												title: 'Welcome' + user.name,
												"user" :person,
												"users" : users
												 });	
											},
											//JSON returns the item with the message that is has been deleted
											json: function(){
												res.json({message : 'deleted',
													item : temp
												});
											}
										});
									});
								}
								else {
				    				// Update front end in case deletion is invalid 
								}
							}
					});
		    	});
	        }
	    });
	else {
		console.log("Access Denied: Cannot remove user unless ADMIN")
	}
});

router.delete(('/'), function(req,res)
{
    mongoose.model('User').remove({}, function(err) { 
	console.log('Collection Removed');
    });
});

module.exports = router;