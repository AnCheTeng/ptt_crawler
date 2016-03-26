// npm install
var express = require('express');
var mongoose = require('mongoose');
var Ptt = require('./Ptt');

var app = express();

mongoose.connect('mongodb://localhost/ptt');

app.get('/:count', function(request, response) {
  Ptt.findOne({
    count: request.params.count
  }).exec(function(err, result) {
    if (result) {
      response.send(result.article);
      console.log('Request for: ' + result.url);
      console.log('Sequence number: #' + result.count);
    } else {
      response.send("Not found!");
    }
  })
});

app.listen('8080', function(request, response) {
  console.log("=================Server is starting, listening to 8080 port=================");
});
