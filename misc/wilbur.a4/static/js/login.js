var IP;

//Get IP address
function getip(json){
    IP =json.ip;
}

$(document).ready(main);

function main(){
    $("#btnSubmit").click(btnEvent);
}

//Event handler when the log in button is clicked
function btnEvent(){
    //Get all the input fields
    var email, password, message;
    email = $("#inputEmail").val();
    password = $("#inputPassword").val();
    message = $("#message");

    //Send a GET request to see if the password stored in the database matched with the input field
    $.ajax({
        type:"GET",
        url:"http://127.0.0.1:3000/api/users/"+email,
        success: function(data){
            //If the password matches, store the logged in user's ID (email) in a session, and then log in
            if (data.password == password){
                message.attr("class", "text-success");
                message.text("Success");

                sessionStorage.loggedInUser = email;
                login();
            }else{
                message.attr("class", "text-danger");
                message.text("Error: Incorrect password");
            }
        },
        statusCode: {
            //Handles error
            404:function(){
                message.attr("class", "text-danger");
                message.text("Error: This account is not registered");
            }
        }
    });
}

//Login a user account
function login(){
    var email = $("#inputEmail").val();
    //Before loggin in, record a "behavior", which includes meta-data such as
    //this session's IP address, logged in date, and device sizes
    $.ajax({
        type:"POST",
        url:"http://127.0.0.1:3000/api/users/"+email+"/behaviors",
        data:{
            date: getDate(),
            ip:IP,
            device_width:screen.width,
            device_height:screen.height
        },
        success: function(){
            //Move to the welcome page upon login
            window.location='http://localhost:3000/welcome.html';
        }
    });
}

//Return the current date, in the format: year/month/day hour:minute:second
function getDate(){
    var current = new Date();  
    var year    = current.getFullYear();
    var month   = current.getMonth()+1; 
    var day     = current.getDate();
    var hour    = current.getHours();
    var minute  = current.getMinutes();
    var second  = current.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
}