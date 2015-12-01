var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
	
	accountType: String, //This field is either "local" or "google"
    userType: String, //This field is either "admin" or "user"
    description: String,
    phone: String,
    //Additional fields that may be added depending on front end implementation
    //dob: String,
    //fname: String,
    //lname: String, 

    // Weighted User Rating system values
    //onestarOwner : Number,
    //twostarOwner : Number,
    //threestarOwner : Number,
    //fourstarOwner : Number,
    //fivestarOwner : Number,
    //avgratingOwner : Number, 

    //onestarBorrow : Number,
    //twostarBorrow : Number,
    //threestarBorrow : Number,
    //fourstarBorrow : Number,
    //fivestarBorrow : Number,
    //avgratingBorrow : Number, 

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