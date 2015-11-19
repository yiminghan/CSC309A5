
$(document).ready(main);

function main(){
	//Get details about the currently logged in user and update page content
    getLoggedInUser();
    //Get all behaviors of the currently selected user and populate entries onto the table
	getAllRecords();

    //Set up all button listeners
	$("#btnLogout").click(logout);
	$("#account_display").click(function(){
		sessionStorage.selectedUser= sessionStorage.loggedInUser;
		window.location='http://localhost:3000/profile.html';
	});
}

//Logout of the currently logged in account
function logout(){
    //Clear the session, and move to the inital page again
	sessionStorage.clear();
	window.location='http://localhost:3000/index.html'
}

//Get all behaviors of the currently selected user and populate entries onto the table
function getAllRecords(){
	var email=sessionStorage.selectedUser;
	$.get('http://localhost:3000/api/users/'+ email + "/behaviors", function(behaviors){
		for (var i = 0; i < behaviors.length; i++) {
            //Insert every record
			insertRecord(
				behaviors[i].logged_in_date, behaviors[i].ip_addr,
				behaviors[i].device_height, behaviors[i].device_width
			);
		}
	});
}

//Insert a behavior into a table
function insertRecord(date, ip, height, width){
	var table = $("#userTable");
	table.append(
		"<tr>" +
			"<td>" + date + "</td>" +
			"<td>" + ip + "</td>" +
			"<td>" + width + ":" + height + "</td>" +
		"</tr>"
	);
}

//Get more details about the currently logged in user to update page content
function getLoggedInUser(){
	if (!sessionStorage.loggedInUser){
		alert("Please log in");
	}else{
        //Get the id of the logged in user, and find that more information about that user through a GET request
		var email = sessionStorage.loggedInUser;
		$.ajax({
            type:"GET",
            url:"http://127.0.0.1:3000/api/users/"+email,
            success: function(user){
                //Update the top right corner display panel
        		$("#account_display").text(user.display_name);
            },
            statusCode: {
                404:function(){
                    alert("Unregistered account")
                }
            }
        });
	}
}

