var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
    title: String,
    authors:String,
    ISBN: String,
    ratecount : Number,
    rating: Number});
	

// var ratingSchema = new mongoose.Schema({
//     ISBN : String,
//     rater : String,
//     comment : String,
//     rating : Number
// });

// mongoose.model('Rating', ratingSchema);
module.exports = mongoose.model('Book',bookSchema);
