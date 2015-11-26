var express=require("express");
var morgan=require("morgan");
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var path=require("path");
var session=require("express-session");
var cookieParser=require("cookie-parser");
var passport=require("passport");
var flash=require('connect-flash');

//Connect to mongoose
mongoose.connect('mongodb://127.0.0.1/A5');
//Configure some passport settings
require('./config/passport')(passport);

var app=express();
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({secret:"mysecret", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require("./routes/route.js")(app, passport);

//YiMing's book API
// app.use('/books', books);

//Serves the static files (css, image, and javascript file)
//The HTMLs are not static
app.use(express.static(path.join(__dirname,"static")));

// set up ejs for templating
app.set('view engine', 'ejs'); 


app.listen(3000, function(){
	console.log("Server running")
});