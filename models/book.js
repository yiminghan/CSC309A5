var mongoose = require('mongoose');
var bookSchema = new mongoose.Schema({
    title: String,
    description: String,
    course: String,
    owner: String,
	borrower: String,
	avaiableTime : String,
	avaiable: Boolean,
	ISBN: String,
	ratecount : Number,
    rating: Number});
	


mongoose.model('Books',bookSchema);
