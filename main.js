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
	server(3000, 'mongodb://127.0.0.1/A5');
}
