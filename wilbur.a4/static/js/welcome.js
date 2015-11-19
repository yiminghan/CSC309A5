$(document).ready(main);

function main(){
    //Get details about the currently logged in user and update page content
	getLoggedInUser();
    //Get all users in the database and populate table
	getAllUsers();

    //register button events
	$("#btnLogout").click(logout);
	$("#account_display").click(function(){
        //When the account display (at the top right corner) is clicked, store the selected user id (which in this case is the logged in user himself) into session and move to the profile page
		sessionStorage.selectedUser= sessionStorage.loggedInUser;
		window.location='http://localhost:3000/profile.html';
	});
}

// Get all users recorded in the database, and populate them into the list (table) of users
function getAllUsers(){
    // Issue a GET request using the API
	$.get('http://localhost:3000/api/users',function(users){
		for (var i = 0; i < users.length; i++) {
            //Insert every user into the table
			insertUser(users[i].email, users[i].display_name);
		}
        // Register an event listener for every row (every user) in the table, so that when a row is clicked, the window can be navigated to the specified user's profile page
		$(".userLink").click(function(e){
            //Store the selected (clicked) user's id (email) into session, and move to the profile page
			sessionStorage.selectedUser= $(this).attr('email');
			window.location='http://localhost:3000/profile.html';
		});
	});
}

//Insert a particular user into the list (table) of users
function insertUser(email, displayName){
	var table = $("#userTable");
	table.append(
		"<tr>" +
			"<td>" + email + "</td>" +
			"<td> <a class='userLink' email=" + email + ">" + displayName + "</a> </td>" +
		"</tr>"
		);
}

//Logout of the currently logged in account
function logout(){
    //Clear the session, and move to the inital page again
	sessionStorage.clear();
	window.location='http://localhost:3000/index.html'
}

// Get details about the currently logged in user, and correspondingly update page content
function getLoggedInUser(){
    // If the currently logged in user's ID is not found in session
	if (!sessionStorage.loggedInUser){
		alert("Please log in");
	}else{
		var email = sessionStorage.loggedInUser;

        // Issue a GET request for the logged in user
		$.ajax({
            type:"GET",
            url:"http://127.0.0.1:3000/api/users/"+email,
            success: function(data){

                //Update the account display name in the header
            	$("#account_display").text(data.display_name);
            },

            //Handles error in the case this user is not found
            statusCode: {
                404:function(){
                    alert("Unregistered account")
                }
            }
        });
	}
}

