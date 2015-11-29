var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({

    // matches the system generated Id from User Schema
    messengerId : String,
    messengerName : String,
    receiverId  : String,
    messageTitle : String,
    message : String,
    //checks if the user has read the message
    read : Number, //0 for false, >1 for true
    dateSent : Date
});

module.exports = mongoose.model('Message', messageSchema);
