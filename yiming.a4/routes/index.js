var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'THE A4 NETWORK' });
});


router.use(express.static(__dirname + '/stylesheets'));

router.get('/stylesheets/style.css', function(req, res, next) {
       res.sendFile('style.css');
});

router.get('/logo.png', function(req, res, next){
    var options = {
    root: __dirname + '/public/',
    headers: {
        'x-sent': true
    }
    };
    res.sendFile('logo.png', options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:');
    }
  });
});


module.exports = router;
