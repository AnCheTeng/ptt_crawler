var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ptt = new Schema({
  article: String,
  url: String,
  count: Number
}, {
  versionKey: false
});

module.exports = mongoose.model('Ptt', Ptt);
