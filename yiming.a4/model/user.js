var mongoose = require('mongoose');
var blobSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    description: String,
    views : Number,
    admin : Number});
mongoose.model('User',blobSchema);
   
