var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multiparty = require('multiparty'),
    methodOverride = require('method-override');


router.route('/new/:id')
    .get(function (req, res) {//get unread mesasges from a certain user
	//check authentication
	var data = {authenticated : "false"};
	if (req.isAuthenticated()){
	    data = {authenticated : "true", user:req.user};
	    var isSameUser = (data.user._id == req.param('id'));
	    if(!isSameUser){
		res.json({success: 0 , message: "You do not have permission to see these messages!"});
	    } else { //isSameUser
		mongoose.model('Message').find({receiverId:data.user._id, read : 0}).sort({date: -1}).exec(function (err, messages){
		    if (err) {
			res.json({success : 0, message:"There was an error retreiving from the database: " + err});
		    } else {
			res.json({success : 1, messages : messages});
		    }
		});
	    }
	}
    })
    .post(function (req, res) { //create a new message for :id to receive
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "false") {
	    res.json({success :0, message : "You have to login first"});
	} else {//authentication passed
	    var form = new multiparty.Form();
	    form.parse(req, function(err, fields, files){
		var messengerName;
		if (data.user.accountType == "local") {
		    messengerName = data.user.local.username;}
		else { messengerName = data.user.google.name;}
		if (data.user.accountType == 'admin'){ //notify the receiver that the messenger is an admin
		    messengerName = '(admin)' + messengerName;
		}
		var receiverId = req.param('id');
		var messageTitle = fields.messageTitle;
		var message = fields.message;
		var read = 0;
		var dateSent = new Date();
		mongoose.model('Message').create({
		    messengerId: data.user._id,
		    messengerName: messengerName,
		    receiverId : receiverId,
		    messageTitle: messageTitle,
		    read : read,
		    dateSent : dateSent
		}, function (err, message) {
		    if (err) {
			res.json({success : 0, message:"There was a problem adding to the database."});
		    } else {
			res.json({success : 1, message: message});
		    }
		});
		
	    });
	}
    });

router.route('/sent')
    .get(function (req, res) {
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
	}q
	if (data.authenticated == "false"){
	    res.json({success : 0 , message : "You have to login first to check your messages"});
	} else {//authenticated == "true"
	    mongoose.model('Message').find({messengerId:data.user._id}).sort({date: -1}).exec(function (err, messages){
		if (err) {
		    res.json({success : 0, message:"There was an error retreiving from the database: " + err});
		} else {
		    res.json({success : 1, messages : messages});
		}
	    });
	}
    });

router.route('/update/')
    .get(function (req, res, next) {
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
	}
	if (data.authenticated == "false"){
	    res.json({success : 0, message: "You have to login first to check messages"});
	} else {//authenticated == "true"
	    mongoose.model('Message').count({receiverId : req.user._id, read : 0}, function (err, count){
		if (err) {
		    res.json({success:0});
		} else {
		    res.json({success : 1, count:count});
		}
	    });
	}
    });

router.route('/update/:id')
    .post(function (req, res, next) {
	var data = {authenticated : "false"};
	if (req.isAuthenticated()) {
	    data = {authenticated : "true", user : req.user};
	    mongoose.model('Message').findById( req.param('id'), function (err, post){
		if(post.receiverId = data.user._id) {
		    var readcount = post.read + 1;
		    post.update({
			read : readcount
		    });
		}
	    });
	}
    });
module.exports = router;
