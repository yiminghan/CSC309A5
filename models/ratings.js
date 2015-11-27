var mongoose = require('mongoose');
var Schema = mongoose.Schema();

var userSchema = new Schema({
	ratingId : Number,
	userId : Number,
	ratingType : String, // Either owner or rating 
	comment : String  
});

mongoose.model("Ratings", userSchema);