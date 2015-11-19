
$(document).ready(main);

function main(){
    //Get details about the currently logged in user and update page content
	getLoggedInUser();
    //Get details about the currently selected user and update page content
	getSelectedUser();

    //Register button event handler
	$("#btnLogout").click(logout);
	$('#btnMakeAdmin').click(makeAdmin);
	$("#btnUndoAdmin").click(undoAdmin);
	$('#btnDeleteUser').click(deleteUser);
	$("#btnViewBehavior").click(function(){
		window.location='http://localhost:3000/behavior.html';
	});
	$("#account_display").click(function(){
        //When the account display (at the top right corner) is clicked, store the selected user id (which in this case is the logged in user himself) into session and move to the profile page
		sessionStorage.selectedUser= sessionStorage.loggedInUser;
		window.location='http://localhost:3000/profile.html';
	});
}

//Delete a user (the currently selected user)
function deleteUser(){
    //Get the selected user and issue a DELETE request via API
	var email = sessionStorage.selectedUser;
	$.ajax({
		type:"DELETE",
		url:"http://127.0.0.1:3000/api/users/"+email,
		success: function(data){
            //Move to the welcome page after deletion
			window.location="http://localhost:3000/welcome.html"
		},
		statusCode: {
            404:function(){
                $("#btnMessage").attr("class", "text-danger");
				$("#btnMessage").text("Some error has occurred, try re-logging in");
            }
        }

	});
}

//Make a user admin (the currently selected user)
function makeAdmin(){
	var email = sessionStorage.selectedUser;
    //Update the selected user's user type by issuing a PUT request via API
	$.ajax({
		type:"PUT",
		url:"http://127.0.0.1:3000/api/users/"+email,
		data:{
			type:"admin"
			},
		success: function(data){
            //Update page content to reflect the change
			$("#btnMessage").attr("class", "text-success");
			$("#btnMessage").text("Updated!");
			getSelectedUser();
		},
		statusCode: {
            404:function(){
                $("#btnMessage").attr("class", "text-danger");
				$("#btnMessage").text("Some error has occurred, try re-logging in");
            }
        }

	});
}

//De-previlege an admin (which is the currently selected user)
function undoAdmin(){
	var email = sessionStorage.selectedUser;
    //Update the selected user's user type by issuing a PUT request via API
	$.ajax({
		type:"PUT",
		url:"http://127.0.0.1:3000/api/users/"+email,
		data:{
			type:"user"
			},
		success: function(data){
             //Update page content to reflect the change
			$("#btnMessage").attr("class", "text-success");
			$("#btnMessage").text("Updated!");
			getSelectedUser();
		},
		statusCode: {
            404:function(){
                $("#btnMessage").attr("class", "text-danger");
				$("#btnMessage").text("Some error has occurred, try re-logging in");
            }
        }

	});
}

//Logout of the currently logged in account
function logout(){
    //Clear the session, and move to the inital page again
	sessionStorage.clear();
	window.location='http://localhost:3000/index.html'
}

//Get more details about the currently logged in user to update page content
function getLoggedInUser(){
	if (!sessionStorage.loggedInUser){
		alert("Please log in");
	}else{
		var email = sessionStorage.loggedInUser;
		$.ajax({
            type:"GET",
            url:"http://127.0.0.1:3000/api/users/"+email,
            success: function(user){
                //Update the top right corner display panel
        		$("#account_display").text(user.display_name);

        		//Update the visibility of the buttons, depending on what is the user type of the currently logged in user

                //Any user can edit their own profile, so set the edit button visible (initial)
        		if (sessionStorage.selectedUser == sessionStorage.loggedInUser){
        			$("#btnEditProfile").css("display", "initial");
        		}

                //All admins can edit anyone's profile and view anyone's behavior
        		if (user.type == "admin" || user.type == "super admin"){
        			$("#btnEditProfile").css("display", "initial");
        			$("#btnViewBehavior").css("display", "initial");

                    //Super admin can assign previlege to other users (but not to himself)
        			if (user.type == "super admin"){
        				if (sessionStorage.selectedUser != sessionStorage.loggedInUser){
            				$("#btnMakeAdmin").css("display", "initial");
            				$("#btnDeleteUser").css("display", "initial");
            				$("#btnUndoAdmin").css("display", "initial");
        				}
        			}
        		}
            },
            statusCode: {
                404:function(){
                    alert("Unregistered account")
                }
            }
        });
	}
}

//Get details about the currently selected user and update page content accordingly
function getSelectedUser(){
	if (!sessionStorage.selectedUser){
		alert("Please select a user first");
	}else{
        //Get the id of the selected use, and issue a GET request via API
		var email = sessionStorage.selectedUser;
		$.ajax({
            type:"GET",
            url:"http://127.0.0.1:3000/api/users/"+email,
            success: function(data){
                //Update the page content (description, display name...etc)
        		$("#ddDisplayName").text(data.display_name);
            	$("#ddEmail").text(email);
        		$("#ddDescription").text(data.description);
        		$("#ddType").text(data.type);
        		if (data.profile_pic == "1"){
        			$("#imgProfile").attr("src", "pf1.jpg");
        		}else if (data.profile_pic == "2"){
        			$("#imgProfile").attr("src", "pf2.jpg");
        		}
            },
            statusCode: {
                404:function(){
                    alert("Unregistered account")
                }
            }
        });
	}
}

