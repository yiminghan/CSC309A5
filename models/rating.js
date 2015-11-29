var mongoose = require('mongoose');
var ratingSchema = new mongoose.Schema({
	heading: String,
	postingID :String,
    raterID : String,
    raterName: String,
    comment : String,
    rating : Number
});

module.exports = mongoose.model('Rating', ratingSchema);