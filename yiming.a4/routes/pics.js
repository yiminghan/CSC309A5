var express = require('express');
var multer  = require('multer');
var upload = multer({ dest: '../pics/uploads/' });
var router = express.Router();

router.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
