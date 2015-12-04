var mongoose = require('mongoose');


//The schema for a message. 
//A message contains a messenger and a receiver. 
var messageSchema = mongoose.Schema({
    messengerID : String,
    messengerName : String,
    receiverName : String,
    receiverID  : String,
    message : String,
    //checks if the user has read the message
    read : Boolean, 
    dateSent : {type:Date, default: Date.now}
});

module.exports = mongoose.model('Message', messageSchema);
