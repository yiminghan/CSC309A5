
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  //  adminRight: Number,
    name: String
 //   email: String,
  //  description: String,
 //   password: String
});

module.exports = mongoose.model('user',userSchema);
