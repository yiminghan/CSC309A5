var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
	
	accountType: String, //This field is either "local" or "google"
    userType: String, //This field is either "admin" or "user"
        
    local:{
	    username:String,
        email        : String,  //This field should be unique to each local user
        password     : String,
    },

    google:{
    	id           : String, //This field should be unique to each google user
        token        : String,
        email        : String,
        name         : String
    }
});

// methods ======================

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return this.local.password == password;
};

// generate a unique id
userSchema.methods.generateID = function() {
    return this.local.password == password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);