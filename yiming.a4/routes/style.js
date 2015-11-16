var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/style.css', function(req, res, next) {
       res.sendFile('/style.css');
});

module.exports = router;
