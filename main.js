var express=require("express");
var morgan=require("morgan");  //A logger
var mongoose=require("mongoose"); //A MongoDB ODM tool
var bodyParser=require("body-parser");  //A module for parsing HTTP request body
var path=require("path"); //A module for directory path manipulation
var session=require("express-session"); //A module for session, needed for passport
var cookieParser=require("cookie-parser"); //A module for cookies, neded for passport
var passport=require("passport"); //A module that handles authentication and user sessions
var flash=require('connect-flash'); //Module for storing short messages in the flash area of session
var	cluster	= require('cluster');	
var	numCPUs	= require('os').cpus().length;	



if (cluster.isMaster){
	for (var i = 0; i < numCPUs; i++){
		cluster.fork();
	}
}else{
	//Connect to mongoose
	mongoose.connect('mongodb://127.0.0.1/A5-test');
	//Configure some passport settings
	require('./config/passport')(passport);

	//A list of middleware that our app will be using
	// *The order of these lines matter, do not modify*
	var app=express();
	//app.use(compression());
	app.use(morgan("dev"));
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	app.use(session({secret:"mysecret", resave: false, saveUninitialized: true}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
	app.use("/api", require("./routes/REST-API/user.js"));
	app.use("/api", require("./routes/REST-API/posting.js"));
	app.use("/api", require("./routes/REST-API/rating.js"));
	app.use("/api", require("./routes/REST-API/message.js"));
	require("./routes/route.js")(app, passport);


	//Serves the static files (css, image, and javascript file)
	//The HTMLs are not static
	//, { maxAge: 86400000 }
	app.use(express.static(path.join(__dirname,"static"), { maxAge: 86400000 }));

	// set up ejs for dynamic templating
	app.set('view engine', 'ejs'); 

	app.listen(3000, function(){
		console.log("Server running")
	});
}



