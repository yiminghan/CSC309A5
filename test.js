var assert = require('assert');
var superagent = require('superagent');
var server = require('./server');

// Do not move this file to different directories.
// The test runs on a different database: mongodb://127.0.0.1/A5-test
// This database should be clean and empty before the test is ran
// After the test, the database will be empty again.

describe('Server Test', function(){
	var app;

	//Before starting the test cases, set up the server and database
	before(function() {
		app = server(3000, 'mongodb://127.0.0.1/A5-test', false);
	});

	//close server after testing
	after(function() {
		app.close();
	});

	//These test the rest apis
	describe('Test REST APIs', function(){
		var jenid;
		var amyid;
		var postingid;
		var ratingid;
		var messageid;

		//Creates a post request and test the returned JSON
		it('test post create users API:create user jen', function(done) {
			superagent.post('http://localhost:3000/api/users')
			.send({
				accountType: "local", userType: "user", imgPath: "/avatar/default.png",
				description: "Hello, I am Jen", phone: "647-111-2222", username: "Jen",
				email: "jen@abc.com", password: "jen" 
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				jenid = result._id;
				assert.deepEqual(
				{
					"_id": jenid,
					"phone": "647-111-2222",
					"description": "Hello, I am Jen",
					"imgPath": "/avatar/default.png",
					"userType": "user",
					"accountType": "local",
					"__v": 0,
					"local": {
						"password": "jen",
						"email": "jen@abc.com",
						"username": "Jen"
					}
				}, result);
				done();
			});
		});

		//Same as above. We create another user because we need two of them for
		//testing the messaging apis
		it('test post create users API:create user amy', function(done) {
			superagent.post('http://localhost:3000/api/users')
			.send({
				accountType: "local", userType: "admin", imgPath: "/avatar/default.png",
				description: "Hello, I am amy", phone: "647-111-2222", username: "amy",
				email: "amy@abc.com", password: "amy" 
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				amyid = result._id;
				assert.deepEqual(
				{
					"_id": amyid,
					"phone": "647-111-2222",
					"description": "Hello, I am amy",
					"imgPath": "/avatar/default.png",
					"userType": "admin",
					"accountType": "local",
					"__v": 0,
					"local": {
						"password": "amy",
						"email": "amy@abc.com",
						"username": "amy"
					}
				}, result);
				done();
			});
		});

		//Sends a get request and test the returned json
		it('test get users API', function(done) {
			superagent.get('http://localhost:3000/api/users').end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(
				[
					{
						"_id": jenid,
						"phone": "647-111-2222",
						"description": "Hello, I am Jen",
						"imgPath": "/avatar/default.png",
						"userType": "user",
						"accountType": "local",
						"__v": 0,
						"local": {
							"password": "jen",
							"email": "jen@abc.com",
							"username": "Jen"
						}
					},
					{
						"_id": amyid,
						"phone": "647-111-2222",
						"description": "Hello, I am amy",
						"imgPath": "/avatar/default.png",
						"userType": "admin",
						"accountType": "local",
						"__v": 0,
						"local": {
							"password": "amy",
							"email": "amy@abc.com",
							"username": "amy"
						}
					}
				],
	 			result);
				done();
			});
		});

		//Insert a script in the HTTP body fields.
		//Test if the the server detects this and sends an error message back
		it("Create new posting, should detect XSS attack", function(done){
			superagent.post('http://localhost:3000/api/postings')
			.send({
				ownerID: amyid, ownerName: "amy", postingTitle: "cheap book!",
				authors: "<script>evil</script> Harmen", ISBN: "12321", 
				bookTitle : "Intro to Web",	description: "A good book", price: "20", 
				field: "Comp Sci", availability: "true"
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual({error: "invalid input! Try again."}, result);
				done();
			});
		});

		//Creates a posting and test the returned json
		it("Test create new posting", function(done){
			superagent.post('http://localhost:3000/api/postings')
			.send({
				ownerID: amyid, ownerName: "amy", postingTitle: "cheap book!",
				authors: "Harmen", ISBN: "12321", 
				bookTitle : "Intro to Web",	description: "A good book", price: "20", 
				field: "Comp Sci", availability: "true"
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				postingid = result._id
				console.log("postingid: " + postingid);
				assert.deepEqual(
					{
					    "_id": postingid,
					    "availability": "true",
					    "field": "Comp Sci",
					    "price": 20,
					    "description": "A good book",
					    "ownerID": amyid,
					    "authors": "Harmen",
					    "bookTitle": "Intro to Web",
					    "postingTitle": "cheap book!",
					    "ISBN": "12321",
					    "__v": 0
					 }, result);
				done();
			});
		});

		//Create a rating and test the returned json
		it("test create rating on a posting", function(done){
			superagent.post('http://localhost:3000/api/postings/' + postingid + "/ratings")
			.send({
				heading: "Good book", raterID: amyid, rateName: "amy", rating: "5",
				comment: "I love this book"
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				ratingid = result._id
				assert.deepEqual({
					"_id": ratingid,
					"rating": 5,
					"comment": "I love this book",
					"raterID": amyid,
					"heading": "Good book",
					"postingID": postingid,
					"__v": 0
				}, result);
				done();
			});
		});

		//Remove a rating and test the returned json
		it("test remove rating on a posting", function(done){
			superagent.delete('http://localhost:3000/api/postings/' + postingid + "/ratings/" + ratingid)
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(1, result.ok);
				done();
			});
		});

		//Remove a posting and test the returned json
		it("test remove a posting", function(done){
			superagent.delete('http://localhost:3000/api/postings/' + postingid)
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(1, result.ok);
				done();
			});
		});



		it("create a message", function(done){
			superagent.post('http://localhost:3000/api/messages')
			.send({
				messengerID: amyid, messengerName: "amy", receiverID: jenid,
				receiverName: "jen", message: "Hello, jen"
			})
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				messageid = result._id
				assert.deepEqual(amyid, result.messengerID);
				assert.deepEqual("amy", result.messengerName);
				assert.deepEqual(jenid, result.receiverID);
				assert.deepEqual("jen", result.receiverName);
				assert.deepEqual("Hello, jen", result.message);
				done();
			});
		});

		it("remove a message", function(done){
			superagent.delete('http://localhost:3000/api/messages/' + messageid)
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(1, result.ok);
				done();
			});
		});

		
		//Remove the users
		it("delete user amy", function(done){
			superagent.delete('http://localhost:3000/api/users/' + amyid)
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(1, result.ok);
				done();
			});
		});

		it("delete user jen", function(done){
			superagent.delete('http://localhost:3000/api/users/' + jenid)
			.end(function(err, res) {
				assert.ifError(err);
				var result = JSON.parse(res.text);
				assert.deepEqual(1, result.ok);
				done();
			});
		});
	});
	
	//Test some web page endpoint
	//Not every page is tested
	describe("Test some web page route endpoints", function(){
		it("test home page", function(done){
			superagent.get('http://localhost:3000/home.html')
			.end(function(err, res) {
				assert.ifError(err);
				done();
			});
		});

		it("test about us page", function(done){
			superagent.get('http://localhost:3000/about-us.html')
			.end(function(err, res) {
				assert.ifError(err);
				done();
			});
		});

		it("test login page", function(done){
			superagent.get('http://localhost:3000/login.html')
			.end(function(err, res) {
				assert.ifError(err);
				done();
			});
		});

		it("test signup page", function(done){
			superagent.get('http://localhost:3000/signup.html')
			.end(function(err, res) {
				assert.ifError(err);
				done();
			});
		});
	});
});