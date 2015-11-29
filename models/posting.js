var mongoose = require('mongoose');
	
var postingSchema = new mongoose.Schema({
    ISBN : String,
    authors: String,
    bookTitle: String,
    postingTitle: String,
    ownerID : String,
    ownerName: String,
    description : String,
    availability: String,
    price: Number,
    field: String
});

module.exports = mongoose.model('Posting', postingSchema);
