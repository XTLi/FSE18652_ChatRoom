var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/chatRoom');
var Schema = mongoose.Schema;

var messageRocordScheMa = new Schema({
	name: String,
	time: String,
	message: String
});

exports.MessageRecord = db.model('messages', messageRocordScheMa); 

