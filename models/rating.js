var mongoose = require('mongoose');

//The schema of a rating
//A rating is tied to a posting. A rating has a heading, a numerical rating (out of 5),
//and a short comment
var ratingSchema = new mongoose.Schema({
	heading: String, 
	postingID :String, //The posting this rating belongs to
    raterID : String,
    raterName: String,
    comment : String,
    rating : Number  //A score out of 5, minimum is 1.
});

module.exports = mongoose.model('Rating', ratingSchema);