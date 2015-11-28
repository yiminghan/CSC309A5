var mongoose = require('mongoose');
var bookSchema = new mongoose.Schema({
    title: String,
    course: String,
    ISBN: String,
    ratecount : Number,
    rating: Number});
	
var postingSchema = new mongoose.Schema({
    ISBN : String,
    owner : String,
    description : String,
    postingname : String
});

var ratingSchema = new mongoose.Schema({
    ISBN : String,
    rater : String,
    comment : String,
    rating : Number
});

mongoose.model('Rating', ratingSchema);
mongoose.model('Postings', postingSchema);
mongoose.model('Books',bookSchema);
