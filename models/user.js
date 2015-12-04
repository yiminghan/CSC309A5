var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
//A user has two account types, depending on whether they login by signing up locally
//in our website, or if they login using a google account.
//The account type field specifies what type of account this user is.
var userSchema = mongoose.Schema({
	
	accountType: String, //This field is either "local" or "google"
    userType: String, //This field is either "admin" or "user". The first user is automatically admin
    imgPath : String, //A path to an avatar for user's profile image
    description: String,
    phone: String,
        
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
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// // generate a unique id
// userSchema.methods.generateID = function() {
//     return this.local.password == password;
// };

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);