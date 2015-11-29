var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multiparty = require('multiparty'),
    methodOverride = require('method-override');

router.route('/')
    .post(function(req, res, next) {
	//TODO: find out if the user logged in or not
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
	    var name = fields.name;
	    var subject = fields.subject;
	    var ISBN = fields.ISBN;
	    var open = true;
	    var description = "no description yet by this person";
	    if(fields.description){ description = fields.description;}
	    var avaiableTime = fields.avaiableUntil; //This is in the format ('YYYY-MM-DD')
	    var rating = 10 //Default reating of 10/10
	    var ownerId = 99999999 // TODO: implement onwerId with session storage. 

	    mongoose.model('Books').create({
		title: name,
		description: description,
		course: subject,
		owner: ownerId,
		avaiableTime : avaiableTime,
		avaiable: open,
		ISBN: ISBN,
		ratecount  : 1, //Start with one to avoid divide by 0
		rating: rating} , function (err, book) {
	    if(err){
		res.send("There was a problem adding the information to the databse.");
	    } else {
		res.json(book);}
		});
	});
    })

    .get(function(req,res,next) {
	//TODO: find out if the user logged in or not
	mongoose.model('Books').find({},function (err, books) {
	    if (err) {
		console.log(err);
	    } else {
		res.json(books);
	    }});
    });

router.get('/new', function(req,res) {
    //get a new book
    //TODO: Wilbur: render the book creation page here
});

//Search book by subject
router.route('/subject/:subject')
    .get(function(req,res) {
	mongoose.model('Books').find({course: req.param('subject')}, function(err, books) {
	    console.log('GET Retrieving Books for the Course:' + books.course);
	    res.json(books);
})});

//Help function to look up books for debug
router.route('/id/:id')
    .get(function(req, res) {
	mongoose.model('Books').findById(req.param('id'), function(err , book) {
	    if (err) {
		console.log('GET Error: There was a problem retreiving: ' + err);
	    } else {
		res.json(book)
	    }});
    });

//Edit a book's avaiable time or rent a book
router.route('/edit/:id')
    .get(function (req, res) {
	//render the specific book edit view
    })
    .post(function (req, res) {
	var ownership = false;
	var admin = false;
	//TODO: use session to check if the owner is editing or another user
	//      if it's the owner update the avaiable time
	//      other wise update the rating
	//TODO: check admin rightfor the person
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
	    mongoose.model('Books').findById(req.param('id'),function (err, book) {
		if (err) {
		    console.log('GET Error: There was a problem retriving: ' + err);
		} else {
		    if (admin) {
			//TODO: decide what the admin can do (update, delete, etc)
		    } else {
			if(ownership == true) {
			    
			    console.log('GOT O  BOOK , Editing');
			    //You can only change the avaiable time when book is avaible. This can be changed later.
			    if(book.avaiable)
			    {
				var time = fields.avaiableUntil;
				book.update({
				    avaiableTime: time
				}, function (err, b) {
				    if (err) {
					res.send("There was a problem updating the information to the databse: " + err);
				    } else {
					
					mongoose.model('Books').findById(req.param('id'), function (err, newbook) {
					    res.json(newbook);
					});
				    }
				});
			    }
			} else { //Not owner
			    //Returning book
			    if(!book.avaiable)
			    {
				var checkBorrower = true;
				//TODO: implement checkBorrower to determine if it is the right one
				if(fields.rating != undefined){
				    //TODO: add optional comments on the experience, add a new db for comments
				    var weightedRating = book.rating * book.ratecount;
				    var count = book.ratecount + 1;
				    var rating = parseInt(fields.rating);
				    weightedRating = weightedRating + rating;
				    var newRating = weightedRating/count; //not formatted for now
				    //TODO: notify the user using the social media option
				    book.update({
					avaiable: true,
					ratecount: count,
					rating: newRating
				    }, function (err, b) {
					if (err) {
					    res.send("There was a problem updating the information to the databse: " + err);
					} else {
					    mongoose.model('Books').findById(req.param('id'), function (err, newbook) {
						res.json(newbook);
					    });
					}
				    });
				}
			    } else {
				//Borrowing the book
				var borrowerId = 999999;
				//TODO: get the borrowerId from session
				//TODO: notify the owner using the social media option
				book.update({
				    avaiable : false,
				    borrower: borrowerId
				},function (err, b) {
				    if (err) {
					res.send("There was a problem updating the information to the databse: " + err);
				    } else {
					mongoose.model('Books').findById(req.param('id'), function (err, newbook) {
					    res.json(newbook);
					});
				    }
				});
			    }
			}
		    }
		}
	    });
	});
    })
    .delete(function (req, res) {
	var ownership = true; //TODO: check ownership
	var admin = false; //TODO: check admin
	if(ownership||admin){
	    mongoose.model('Books').findById(req.param('id'), function (err, book) {
		if (err) {
		    return console.error(err);
		} else {
		    console.log('DELETE removing ID: ' + book._id);
		    book.remove(function (err, b) {
			if (err){
			    return console.error(err);
			} else {
			    res.send('Successfully deleted.');
			}
		    });
		}
	    });
	}
    });


module.exports = router;
