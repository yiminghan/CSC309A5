var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multiparty = require('multiparty'),
    methodOverride = require('method-override');

router.route('/')
    .post(function(req, res, next) {
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user: req.user};
	    
	    var form = new multiparty.Form();
	    form.parse(req, function(err, fields, files){
		var name = fields.bookTitle;
		var subject = fields.subject;
		var ISBN = fields.ISBN;
		var ownerName = fields.ownerName;
		var postingtitle = fields.postingName;
		var authors = fields.authors;
		var price = fields.price;
		var description = "no description yet by this person";
		if(fields.description){ description = fields.description;}
		var rating = 10 //Default rating of 10/10
		var ownerId = data.user._id  ;
		
		if(data.authenticated == "false"){
		    res.json({success: 0});}
		else if(data.authenticated == "true"){
		    mongoose.model('Books').find({ISBN : ISBN}, function (err, results) {
			
			mongoose.model('Postings').create({
			    ISBN : ISBN,
			    ownerID : ownerID,
			    ownerName : ownerName,
			    description : description,
			    availability : "True",
			    price : price,
			    authors : authors,
			    bookTitle : name,
			    price : price,
			    field: subject,
			    postingTitle : postingtitle
			}, function ( err, posting){
			    if (err) {
				res.send("There was a problem adding the information to the databse.");
			    } else{
				var Tbook = results; //empty temp object to hold the new book object.
				if (!results.length){ //Creates a new book object
				    mongoose.model('Books').create({
					title: name,
					authors: authors,
					ISBN: ISBN,
					ratecount  : 1, //Start with one to avoid divide by 0
					rating: rating} , function (err, book) {
					    if(err){
						res.send("There was a problem adding the information to the databse.");
					    } else {
						Tbook = book;}
					});
				}
				res.json({success: 1, posting : posting, book: Tbook});			 
			    }
			});
		    });
		}
	    });
	} else {
	    res.json({success : 0, message : "login failed"});
	}
    })
		    
    .get(function(req,res,next) {
	if (req.isAuthenticated()){
	    mongoose.model('Books').find({}).sort({rating: 'desc'}).exec(function (err, books) {
		if (err) {
		    console.log(err);
		} else {
		    res.json(books);
		}
	    });
	} else {
	    res.json({success : 0, message : "login failed"});
	}
    });




//Search book by subject
router.route('/subject/:subject')
	 .get(function(req,res) {
	     if (req.isAuthenticated()){
		 mongoose.model('Books').find({course: req.param('subject')}, function(err, books) {
		     console.log('GET Retrieving Books for the Course:' + books.course);
		     res.json(books);
		 });
	     } else {
		 res.json({success : 0, message : "login failed"});
	     }
	 });

//Help function to look up books for debug, will not be used in the final ship
router.route('/id/:id')
    .get(function(req, res) {
	mongoose.model('Books').findById(req.param('id'), function(err , book) {
	    if (err) {
		console.log('GET Error: There was a problem retreiving: ' + err);
	    } else {
		res.json({success : 1, book : book});
	    }});
    });

	 
//Edit a book's avaiable time or rent a book
router.route('/edit/:id')
	 .post(function (req, res) {
	     var data = {authenticated : "false"};
	     if (req.isAuthenticated()) {
		 data = {authenticated : "true", user: req.user};
	     }
	     var admin = false;
	     if ( data.authenticated == "true"){
		 if (data.user.userType == "admin") {
		     admin = true;
		     console.log("admin premission");//Test logging
		 }
		 
			 var form = new multiparty.Form();
			 form.parse(req, function(err, fields, files){
			     mongoose.model('Books').findById(req.param('id'),function (err, book) {
			 if (!book.length) {
			     res.json({success : 0, message : "No such book found"});
			 } else {
			     if (admin){ //Admin edits the book
				 var title = fields.name;
				 var course = fields.subject;

				 book.update({
				     title : title,
				     course : course,
				     ISBN : ISBN
				 });
			     } else {//User rating
				 mongoose.model('Rating').find({ISBN:book.ISBN, rater : data.user._id} , function (err, results) {
				     var TRating = results;
				     var newBook;
				     var newRating;
				     if(fields.rating != undefined){
					 var comment = fields.comment;
					 var heading = fields.heading;
					 var raterName;
					 if (data.user.accountType == "local") {
					     raterName = data.user.local.username;}
					 else {raterName = data.user.google.name;}
					 var postingID = fields.postingID;
					 //TODO: restrict the posting owner to rate on his own post
					 if (!results.length) {
					     mongoose.model('Rating').create({
						 ISBN : book.ISBN,
						 rater : data.user._id,
						 comment : comment,
						 rating: fields.rating
					     }, function (err, lrating) {
						 if (err) {
						     res.send("There was a problem adding the information to the database.");
						 } else {
						     var weightedRating = book.rating * book.ratecount;
						     var count = book.ratecount + 1;
						     var rating = parseInt(fields.rating);
						     weightedRating = weightedRating + rating;
						     var newRating = weightedRating/count; //not formatted for now
					    
						     book.update({
							 ratecount: count,
							 rating: newRating
						     }, function (err, b) {
							 if (err) {
							     res.send("There was a problem updating the information to the databse: " + err);
							 } else {
							     mongoose.model('Books').findById(req.param('id'), function (err, newbook) {
								 res.json({success : 1, book : newbook});
							     });
							 }
						     });
						 }
					     });
					 } else {//rating already exists
					     oldRating = results.rating;
					     results.update({
						 rating : fields.rating,
						 comment: comment
					     }, function (err, lrate) {
						 if (err) {
						     res.send("There was a problem updating the information to the database: " , + err);
						 } else {
						     var weightedRating = book.rating * book.ratecount;
						     var count = book.ratecount;
						     var rating = parseInt(fields.rating);
						     weightedRating = weightedRating - oldRating + rating;
						     var newRating = weightedRating/count;

						     book.update({
							 ratecount: count,
							 rating: newRating
						     }, function (err, b) {
							 if (err) {
							     res.send("There was a problem updating the information to the databse: " + err);
							 } else {
							     mongoose.model('Books').findById(req.param('id'), function (err, newbook) {
								 res.json({success : 1, book : newbook});
							     });
							 }
						     });
						 }
					     });
					 }
				     }
				 });
			     }
			 }
		     });
		 });
	     } else {//no authentication
		 res.json({success : 0, message : "login failed"});
	     }
	 })
	 
	 .delete(function (req, res) {
	     var data = {authenticated : "false"};
	     if (req.isAuthenticated()) {
		 data = {authenticated : "true" , user : req.user};
	     }
	     var admin = false; //TODO: check admin
	     if (data.user.userType == "admin"){
		 admin = true;
	     }
	     if(admin){
		 mongoose.model('Books').findById(req.param('id'), function (err, book) {
		     if (err) {
			 return console.error(err);
		     } else {
			 console.log('DELETE removing ID: ' + book._id);
			 book.remove(function (err, b) {
			     if (err){
				 return console.error(err);
			     } else {
				 res.json({success : 1 , message : 'Successfully deleted.'});
			     }
			 });
		     }
		 });
	     } else {
		 res.json({success : 0, message: "Authentication failed.  You do not have admin rights,"});
	     }	 
	 });
	 
//returns true only if DateA >= DateB
function compareDate(DateA, DateB){
    var StringA = DateA.split('-');
    var StringB = DateB.split('-');
    if(StringB[0] > StringA[0]){return false;} //Compare Year
    else if(StringB[0] < StringA[0]){return true;}
    else if(StringB[1] > StringA[1]){return false;}//Compare Month
    else if(StringB[1] < StringA[1]){return true;}
    else if(StringB[2] > STringA[2]){return false;}
    else {return true;}
}

module.exports = router;
