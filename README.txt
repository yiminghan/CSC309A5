How to run

We recommend running locally, since we do not have much time to test in detail that heroku works as expected (it should). Also, running locally means you can manually create accounts, postings, and other resources starting from a fresh and clean database.

For demonstration: watch this video
https://www.youtube.com/watch?v=YnnQrrcLZtw

Repo:
https://github.com/yiminghan/CSC309A5

Method 1 (recommended): running locally 
1.	Make sure that the local database 'mongodb://127.0.0.1/A5' is clean and empty
2.	Unzip "a5.zip" and run "npm install" to install all dependencies
3.	Run "node main.js" and wait until you see "Server running" in the console
4.	Go to "http://localhost:3000/"

Method 2: heroku
1.	Go to https://aqueous-dusk-4642.herokuapp.com/home.html
*Note: In the second method, our website is connected to an online mongoDB database: mongodb://<please ask us for db login>@ds041032.mongolab.com:41032/csc309.  In the first method, our website is connected to the local database 'mongodb://127.0.0.1/A5'. 
If you are using the second method, in the online database, there are already some user accounts in the server. The first user (the admin, and the only one) has email: anne@abc.com, password:123, in case you want to log in to that account.
