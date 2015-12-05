var router = require('express').Router();
var Message = require('../../models/message');
var sanitizer = require('sanitizer');

//Return all messages. 
router.get("/messages", function(req, res){
	
	//If there is a query string indicating who the receiver is
    //Find all messages where the receiver matches the query string
    if(req.isAuthenticated()){
	if (req.query.receiverID){
		Message.find({receiverID:req.query.receiverID}, function(err, messages){
			if (err){
				res.send(err);
			}
			res.json(messages);
		});
	}else{
		Message.find({}, function(err, messages){
			if (err){
				res.send(err);
			}
	        res.json(messages);
		});
	}
    } else {
	//send error
    }
});

router.get("/messages/:id", function(req, res){
    if (req.isAuthenticated()) {
	if( req.user._id == req.params.id) {
	    Message.findById(req.params.id, function(err, message){
		if (err)
		    res.send(err);
		res.json(message);
	    })
	}
    }
});

router.post("/messages", validateFields, function(req, res){
    if( req.isAuthenticated()){
    var newMessage = new Message();
      //newMessage.messengerID = req.body.messengerID;
    newMessage.messengerID = req.user._id;
    if (req.body.messengerName){
	newMessage.messengerName = req.body.messengerName;
    }
    if (req.body.receiverID){
	newMessage.receiverID = req.body.receiverID;
    }
    if (req.body.receiverName){
	newMessage.receiverName = req.body.receiverName;
    }
    if (req.body.message){
	newMessage.message = req.body.message;
    }
    if (req.body.read){
	newMessage.read = req.body.read;
    }
    if (req.body.dateSent){
	newMessage.dateSent = req.body.dateSent;
    }
    
    newMessage.save(function(err, message){
	if (err)
	    res.send(err)
	res.json(message);
    });
    }
});



router.delete("/messages/:id", function(req, res){
    if( req.isAuthentciated())
    {
	Message.remove({_id:req.params.id}, function(err, posting){
            if (err)
		res.send(err);
	});
    }
});

 router.route('/messages/new/:id')
     .get(function (req, res) {//get unread mesasges from a certain user
	//check authentication
	var data = {authenticated : "false"};
 	if (req.isAuthenticated()){ 
	    data = {authenticated : "true", user:req.user};
	    var isSameUser = (data.user._id == req.params.id);
	    if(!isSameUser){
		res.json({success: 0 , message: "You do not have permission to see these messages!"});
	    } else { //isSameUser
		mongoose.model('Message').find({receiverID:data.user._id, read : 0}).sort({date: -1}).exec(function (err, messages){
		    if (err) {
 			res.json({success : 0, message:"There was an error retreiving from the database: " + err});
		    } else {
			res.json({success : 1, messages : messages});
		    }
 		});
	    }
	}
     });
//     .post(function (req, res) { //create a new message for :id to receive
// 	var data = {authenticated : "false"};
// 	if (req.isAuthenticated()) {
// 	    data = {authenticated : "true", user : req.user};
// 	}
// 	if (data.authenticated == "false") {
// 	    res.json({success :0, message : "You have to login first"});
// 	} else {//authentication passed
// 	    var form = new multiparty.Form();
// 	    form.parse(req, function(err, fields, files){
// 		var messengerName;
// 		if (data.user.accountType == "local") {
// 		    messengerName = data.user.local.username;}
// 		else { messengerName = data.user.google.name;}
// 		if (data.user.accountType == 'admin'){ //notify the receiver that the messenger is an admin
// 		    messengerName = '(admin)' + messengerName;
// 		}
// 		var receiverId = req.param('id');
// 		var messageTitle = fields.messageTitle;
// 		var message = fields.message;
// 		var read = 0;
// 		var dateSent = new Date();
// 		mongoose.model('Message').create({
// 		    messengerId: data.user._id,
// 		    messengerName: messengerName,
// 		    receiverId : receiverId,
// 		    messageTitle: messageTitle,
// 		    read : read,
// 		    dateSent : dateSent
// 		}, function (err, message) {
// 		    if (err) {
// 			res.json({success : 0, message:"There was a problem adding to the database."});
// 		    } else {
// 			res.json({success : 1, message: message});
// 		    }
// 		});
		
// 	    });
// 	}
//     });

// router.route('/sent')
//     .get(function (req, res) {
// 	var data = {authenticated : "false"};
// 	if (req.isAuthenticated()) {
// 	    data = {authenticated : "true", user : req.user};
// 	}q
// 	if (data.authenticated == "false"){
// 	    res.json({success : 0 , message : "You have to login first to check your messages"});
// 	} else {//authenticated == "true"
// 	    mongoose.model('Message').find({messengerId:data.user._id}).sort({date: -1}).exec(function (err, messages){
// 		if (err) {
// 		    res.json({success : 0, message:"There was an error retreiving from the database: " + err});
// 		} else {
// 		    res.json({success : 1, messages : messages});
// 		}
// 	    });
// 	}
//     });

router.route('/message/update/')
     .get(function (req, res, next) {
 	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
 	}
 	if (data.authenticated == "false"){
 	    res.json({success : 0, message: "You have to login first to check messages"});
 	} else {//authenticated == "true"
	    mongoose.model('Message').count({receiverId : req.user._id, read : false}, function (err, count){
		if (err) {
 		    res.json({success:0});
 		} else {
 		    res.json({success : 1, count:count});
 		}
 	    });
 	}
     });

router.route('/messages/update/:id')
  .post(function (req, res, next) {
 	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
	    mongoose.model('Message').findById( req.param('id'), function (err, post){
		if(post.receiverID = data.user._id) {
		    var read = true;
 		    post.update({
 			read : read
 		    });
 		}
	    });
	}
  })
;
module.exports = router;


//Validate fields in req.body (the input form) to prevent XSS Attacks
function validateFields(req, res, next){
    var flag = false;
    //Check if there are any fields whose value after sanitizing is different from original
    //If there is, then it is an indication that the original field is invalid
    for (var field in req.body){
        if (req.body[field] != sanitizer.sanitize(req.body[field])){
            flag = true;
        }
    }   
    if (flag == true){
        res.json({ error: "invalid input! Try again."});

    }else{
        next();       
    }
}
