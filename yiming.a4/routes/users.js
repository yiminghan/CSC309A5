var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'),//used to manipulate POST
    session = require('express-session'),
    multer = require('multer');


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}))

router.use(function(req, res, next)
	   { req.session.views = (req.session.views || 0) + 1;
	     next();
	   })

//build the REST operations at the base for users
router.route('/')
    .get(function(req, res, next) {
	var session = req.session;
	if(session)
	{
            mongoose.model('User').find({}, function (err, users) {
              if (err) {
                  return console.error(err);
              } else {
		  mongoose.model('User').findOne({email:session.email},function(err, person){
		      if(person)
		      {
		      res.format({
			  html: function(){
                              res.render('users/index', {
				  title: 'All my users',
				  "user" : person,
				  "users" : users
                              });
                    },
                    json: function(){
                        res.json(users);
                    }
		      
                      });
		      }
		      else
		      {
			  res.render('index', { title: 'THE A4 NETWORK' });
		      }
		  });
	      }
            });
	}
	else{
	    res.render('index',{ title: 'THE A4 NETWORK' });
	}
    })

    .post(function(req, res) {
	mongoose.model('User').findOne({email:req.body.email}, function(err, user) {
	    if(err){
		console.log('GET Error: There was a problem retrieving: '+err);
	    }
	    if (!user) {
		var name = req.body.name;
		var email = req.body.email;
		var password = req.body.password;
		var description = "No Description Yet! Tell this person to write something!";
		var admin = 0;
		mongoose.model('User').find({}, function (err, results) {
		    console.log(results);
		    if (!results.length) {
			admin = 2;
		    }
		
		console.log("Admin Rights for this person is: " + admin);			    
		//call the create function for our database
		
		mongoose.model('User').create({
		    name : name,
		    email : email,
		    password : password,
		    description : description,
		    admin : admin,
		    views : 0 
		}, function (err, luser) {
		    if (err) {
			res.send("There was a problem adding the information to the database.");
		    } else {

		 mongoose.model('User').find({}, function (err, users) {
              if (err) {
                  return console.error(err);
              } else {
		  sess = req.session;
		  sess.email = req.body.email;
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
                  });}
		 });
        	
		    }
		});
		});
	    }else if(user) {
		res.render('users/new',{ success: false, message: 'Email already taken' });
	    }
	});
    });

/* GET New User Model. */
router.get('/new', function(req, res) {
    res.render('users/new', { title: 'Add New User' });
});

router.get('/login', function(req, res){
    res.render('users/login', {success:true , message:""});
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    mongoose.model('User').findById(id, function (err, user) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
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
    mongoose.model('User').findOne({email:req.body.email}, function(err, user) {
	if(err){
	    console.log('GET Error: There was a problem retrieving: '+err);
	}
	if (!user) {
	    res.render('users/login', { success: false, message: 'Authentication failed. User not found.' });
	} else if (user) {
	    // check if password matches
	    if (user.password != req.body.password) {
		res.render('users/login',{ success: false, message: 'Authentication failed. Wrong password.' });
	    } else {
		mongoose.model('User').find({}, function (err, users) {
		    if (err) {
			return console.error(err);
		    } else {
			sess = req.session;
			sess.email = req.body.email;
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
				  )});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('User').findById(req.id, function (err, user) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
	  var sess = req.session;
	  console.log('sess.email');
	  mongoose.model('User').findOne({email:sess.email}, function(err, person){
              console.log('GET Retrieving ID: ' + user._id);
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
  });


router.get('/:id/edit', function(req, res) {
    mongoose.model('User').findById(req.id, function (err, user) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
	    var sess = req.session;
	    mongoose.model('User').findOne({email:sess.email}, function(err, person){
		console.log('GET Retrieving ID: ' + user._id);
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
});


router.put('/:id/edit', function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var description = req.body.description;
    var admin = req.body.admin;
   //find the document by ID
        mongoose.model('User').findById(req.id, function (err, user) {
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
                      res.format({
                          html: function(){
                               res.redirect("/users/" + user._id);
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

router.delete('/:id/edit', function (req, res){
    mongoose.model('User').findById(req.id, function (err, user) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
	    var temp = user;
	    var sess = req.session;
	    mongoose.model('User').findOne({email:sess.email}, function(err, person){
		var isEq = (person == user);
		user.remove(function (err, userd) {
                    if (err) {
			return console.error(err);
                    } else {
			//Returning success messages saying it was deleted
			if(!isEq){
			    console.log('DELETE removing ID: ' + temp._id);
			    mongoose.model('User').find({}, function(err, users)
							{
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
			}else{
			    
			    res.render('index',{ title: 'THE A4 NETWORK' });
			}
			}
		});
	    });
        }
    });
});

router.delete(('/'), function(req,res)
{
    mongoose.model('User').remove({}, function(err) { 
	console.log('collection removed')
    });
});

    module.exports = router;
