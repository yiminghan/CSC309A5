var express=require("express");
var morgan=require("morgan");  //A logger
var mongoose=require("mongoose"); //A MongoDB ODM tool
var bodyParser=require("body-parser");  //A module for parsing HTTP request body
var path=require("path"); //A module for directory path manipulation
var session=require("express-session"); //A module for session, needed for passport
var cookieParser=require("cookie-parser"); //A module for cookies, neded for passport
var MongoStore = require('connect-mongo')(session);  //Used for production environment 
var passport=require("passport"); //A module that handles authentication and user sessions
var flash=require('connect-flash'); //Module for storing short messages in the flash area of session


// module for compressing http response to gzip. Omitted (see report for why)
// var compression = require('compression');

var createServer = function(port, db, online){
	//Connect to mongoose
	mongoose.connect(db);
	//Configure some passport settings
	require('./config/passport')(passport);

	//A list of middleware that our app will be using
	// *The order of these lines matter, do not modify*
	var app=express();

	//We initially thought compression can improve performance, but it turns out it cant
	//app.use(compression());

	app.use(morgan("dev"));
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	
	//If we are hosting the server online, use an online database
	if (online == true){
		app.use(session({secret:"mysecret", 
						store: new MongoStore({url:db,
						ttl: 14 * 24 * 60 * 60 }),// = 14 days. Default
				resave: false, saveUninitialized: true}));
	}else{
		app.use(session({secret:"mysecret", resave: false, saveUninitialized: true}));
	}
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
	app.use("/api", require("./routes/REST-API/user.js"));
	app.use("/api", require("./routes/REST-API/posting.js"));
	app.use("/api", require("./routes/REST-API/rating.js"));
	app.use("/api", require("./routes/REST-API/message.js"));
	require("./routes/route.js")(app, passport);

    app.set('port', (process.env.PORT || port));
	//Serves the static files (css, image, and javascript file)
	//We cache the static files for one day (86400000 ms)
	app.use(express.static(path.join(__dirname,"static"), { maxAge: 86400000 }));

	// set up ejs for dynamic templating
	app.set('view engine', 'ejs'); 

	return app.listen(app.get('port'), function(){
		console.log("Server running")
	});	
}


module.exports=createServer;


