var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: String,
    type: String, //This field is either "admin" or "user"
    local:{
        email        : String,  //This field should be unique to each user
        password     : String,
    }
});

// methods ======================

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return this.local.password == password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);