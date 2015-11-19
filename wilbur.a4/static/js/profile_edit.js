
$(document).ready(main);

function main(){
	//Get details about the currently logged in user and update page content
    getLoggedInUser();
    //Get details about the currently selected user and update page content
    getSelectedUser();

    //Register button event handler
	$("#btnLogout").click(logout);
	$("#btnUpdate").click(update);
	$("#btnChangePassword").click(checkPasswordParameter);
	$("#inputProfilePic").change(function(){
		$("#imgProfile").attr("src", "pf" + $(this).val() + ".jpg");
	});
    $("#account_display").click(function(){
        //When the account display (at the top right corner) is clicked, store the selected user id (which in this case is the logged in user himself) into session and move to the profile page
        sessionStorage.selectedUser= sessionStorage.loggedInUser;
        window.location='http://localhost:3000/profile.html';
    });
}

//The event handler for the update password button. Validates the password inputs, ie. do previous password they match?
function checkPasswordParameter(){
	var email = sessionStorage.selectedUser;
	$.ajax({
        type:"GET",
        url:"http://127.0.0.1:3000/api/users/"+email,
        success: function(data){
        	var oldPassword = data.password;

            // Does the old password match?
        	if ($("#inputOldPassword").val() != oldPassword){
        		$("#changePasswordMessage").attr("class", "text-danger");
        		$("#changePasswordMessage").text("old password incorrect");
        	}
            // Is the new password empty?
            else if ($("#inputNewPassword").val() == ""){
        		$("#changePasswordMessage").attr("class", "text-danger");
        		$("#changePasswordMessage").text("new password cannot be blank");
        	}
            // Is the confirmation correct?
        	else if ($("#inputNewPassword").val() != $("#inputConfirmPassword").val()){
        		$("#changePasswordMessage").attr("class", "text-danger");
        		$("#changePasswordMessage").text("new passwords do not match!");
        	}
        	else{
                // Changes password if the validations above all pass
        		changePassword();
        	}
        },
        statusCode: {
            404:function(){
                $("#changePasswordMessage").attr("class", "text-danger");
				$("#changePasswordMessage").text("Some error has occurred, try re-logging in");
            }
        }
    });
}

//Change password by issueing a PUT request via API
function changePassword(){
    //Get the currently selected user
	var email = sessionStorage.selectedUser;
	$.ajax({
		type:"PUT",
		url:"http://127.0.0.1:3000/api/users/"+email,
		data:{
			email:email,
            //update password with the new password
			password:$("#inputNewPassword").val()
			},
		success: function(data){
			$("#changePasswordMessage").attr("class", "text-success");
			$("#changePasswordMessage").text("Updated!");
		},
		statusCode: {
            404:function(){
                $("#changePasswordMessage").attr("class", "text-danger");
				$("#changePasswordMessage").text("Some error has occurred, try re-logging in");
            }
        }
	});
}

//Logout of the currently logged in account
  	function logout(){
	sessionStorage.clear();
	window.location='http://localhost:3000/index.html'
}


//Event handle for updating profile information of the currently selected user
function update(){
    //get the id of the selected user
	var email = sessionStorage.selectedUser;
    //Issue a put request to update the paramaters
	$.ajax({
		type:"PUT",
		url:"http://127.0.0.1:3000/api/users/"+email,
		data:{
			email:email,
            //The new parameters
			description: $("#inputDescription").val(),
			display_name: $("#inputDisplayName").val(),
			profile_pic: $("#inputProfilePic").val()
			},
		success: function(data){
			$("#updateMessage").attr("class", "text-success");
			$("#updateMessage").text("Updated!");
		},
		statusCode: {
            404:function(){
                $("#updateMessage").attr("class", "text-danger");
				$("#updateMessage").text("Some error has occurred, try re-logging in");
            }
        }

	});
}

//Get more details about the currently logged in user to update page content accordingly
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

                //All users can edit their profile and their password, so set those div's visibility to visible (initial)
                if (sessionStorage.selectedUser == sessionStorage.loggedInUser){
                        $("#profileEdit").css("display", "initial");
                        $("#passwordEdit").css("display", "initial");
                }
                //All admins can edit anyone's profile
                else if (user.type == "admin" || user.type=="super admin"){
                    $("#profileEdit").css("display", "initial");
                }else{
                    //Display warning message if the currently logged in user has no previlege to edit the selected user
                    $("#permissionMessage").attr("class", "bg-danger");
                    $("#permissionMessage").css("display", "initial");
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
		alert("Please log in");
	}else{
        //Get the id of the selected use, and issue a GET request via API
		var email = sessionStorage.selectedUser;
		$.ajax({
            type:"GET",
            url:"http://127.0.0.1:3000/api/users/"+email,
            success: function(data){
                //Update the page content (description, display name...etc)
            	$("#inputEmail").val(data.email);
            	$("#inputDescription").val(data.description);
            	$("#inputDisplayName").val(data.display_name);
           		if (data.profile_pic == "1"){
           			$("#imgProfile").attr("src", "pf1.jpg");
           			$("#opt1").attr("selected", "selected");
           		}else if (data.profile_pic == "2"){
           			$("#imgProfile").attr("src", "pf2.jpg");
           			$("#opt2").attr("selected", "selected");
           		}
            },
            statusCode: {
                404:function(){
                    alert("Unregistered account, user not found")
                }
            }
        });
	}

}
