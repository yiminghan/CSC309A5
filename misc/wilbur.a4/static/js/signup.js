var IP;
//Get IP address
function getip(json){
    IP =json.ip;
}

function main(){
    $(btnSubmit).click(submit);
}

//Event handler when sign up button is clicked
function submit(){
    //Get all the input fields and check for validation
    var email, password, confirmPassword, message;
    email = $("#inputEmail").val();
    password = $("#inputPassword").val();
    confirmPassword = $("#inputConfirmPassword").val();
    message = $("#message");

    // Email cant be empty
    if (email == ""){
        message.attr("class", "text-danger");
        message.text("Error: email can't be blank!");
    }

    // Password cant be empty
    else if (password == ""){
        message.attr("class", "text-danger");
        message.text("Error: password can't be blank!");
    }

    //Password have to match
    else if (password != confirmPassword){
        message.attr("class", "text-danger");
        message.text("Error: password do not match!");
    }else{
        
        //Send a post request using the API if the validations were passed
        $.ajax({
            type:"POST",
            url:"http://127.0.0.1:3000/api/users",
            data:{email:email, password:password},
            success: function(data){
                message.attr("class", "text-success");
                message.text("Success");
                
                //Stores the ID (the email) of the logged in user in session
                sessionStorage.loggedInUser=email;
                login();
            },
            statusCode: {
                //Handles error
                409:function(){
                    message.attr("class", "text-danger");
                    message.text("Error: This email is already registered!");
                }
            }
        });
    }
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

$(document).ready(function(){
    main();
});