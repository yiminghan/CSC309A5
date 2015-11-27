var mongoose = require('mongoose');
var Schema = mongoose.Schema();

var userSchema = new Schema({
	userId : String,
	Fname : String,
	Lname : String, 
	dob : String,
	adminRights : Boolean,
	email : String,
	password : String, //Find a way to store passwords more securely than plaintext
	borrowerRating : Number,
	ownerRating : Number
	description : String  
	numBorrowerRatings : Number,
	numOwnerRatings : Number
});

mongoose.model("Users", userSchema);