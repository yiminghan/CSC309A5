var mongoose = require('mongoose');

//The schema for a posting
var postingSchema = new mongoose.Schema({
    ISBN : String, //The ISBN of the book this posting is about
    authors: String, //The author of the book this posting is about
    bookTitle: String,
    postingTitle: String,
    ownerID : String,
    ownerName: String,
    description : String,

    //This is either true or false, a posting can be reused multiple times
    //If it is available now, this field is set to true
    availability: String, 

    //The price for renting
    price: Number,

    //The disciplines this book is in. eg. Computer Science, Biology ...etc.
    field: String
});

module.exports = mongoose.model('Posting', postingSchema);
