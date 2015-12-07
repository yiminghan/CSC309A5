var server = require('./server.js');
var	cluster	= require('cluster');	
var	numCPUs	= require('os').cpus().length;	

//Use cluster to increase parallelism
if (cluster.isMaster){
	for (var i = 0; i < numCPUs; i++){
		//Spawn multiple threads to handle server requests
		cluster.fork();
	}
}else{
	//Listen on port 3000, and use the specified database
	
	//Comment this if uploading to heroku
	//Use a local database if the server is ran locally
	server(3000, 'mongodb://127.0.0.1/A5', false);

	//Uncomment this if uploading to heroku
	//Use an online database is the server is hosted on heroku
	//server(3000, 'mongodb://yimii:csc309@ds041032.mongolab.com:41032/csc309', true);
}
