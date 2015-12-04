
function Start(){
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signUpPage').style.display = 'none';
    document.getElementById('startUp').style.display = 'inline';
}

function signUpPage()
{
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signUpPage').style.display = 'inline';
    document.getElementById('startUp').style.display = 'none';
}


function loginPage()
{
    document.getElementById('signUpPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'inline';
    document.getElementById('startUp').style.display = 'none';
}

function signUpMethod()
{
    if(checkRepeatPW() == 0)
    {
	//checkEmail();
	//Sign up
	
	var email = document.getElementById('semail').value;
	var pwInput = document.getElementById('spassword').value;
	var email = "null";

	var postData = querystring.stringify({
	    name: nameInput,
	    password: pwInput
	});

	var options = {
	    host: 'http://localhost',
	    port: 3000,
	    method: 'POST',
	    path: '/api/users',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length
	    }
	};

	
	// request object
	var req = https.request(options, function (res) {
	    var result = '';
	    res.on('data', function (chunk) {
		result += chunk;
	    });
	    res.on('end', function () {
		console.log(result);
	    });
	    res.on('error', function (err) {
		console.log(err);
	    })
	});
 
	// req error
	req.on('error', function (err) {
	    console.log(err);
	});
	
	//send request witht the postData form
	req.write(postData);
	req.end();
    }
    else
    {
	alert("passwords do not match!");
    }
}

    
function checkRepeatPW()
{
    if(document.getElementById('spassword').value ==
       document.getElementById('spasswordr').value)
    {return 0
    }
    else
    {
	return 1;
    }
}
