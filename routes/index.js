var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var util = require('util');
var fs =require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//上传音频
router.post('/upload',function(req,res){
  var form = new formidable.IncomingForm();
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.uploadDir = __dirname+"/../public/upload";
  form.parse(req, function(err, fields, files) {
    fs.renameSync(files._file.path,form.uploadDir+'/'+files._file.name);
  });
})

module.exports = router;
