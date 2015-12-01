var mongoose = require('mongoose');
var Schema = mongoose.Schema();

var UserRatingSchema = new Schema({
	ratingID : Number,
	userID : Number,
	type : String,
	rating : Number,
	comment : String
});

mongoose.model("UserRatingSchema", UserRatingSchema);