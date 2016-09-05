
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var MessageRecord = require('./models/message').MessageRecord;

//URL for connecting to DB
var url = 'mongodb://localhost:27017/ChatRoom';

//Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected succesfully to DataBase");
  db.close();
});

var tempUsername;
var usernameList = [];

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/enter.html');
});

app.post('/chatroom', function(req, res) {
	tempUsername = req.body.username;
	res.sendFile(__dirname + '/views/chat.html');
});


io.on('connection', function(socket) {
	//A new user connects and update him/her to online userList
	socket.username = tempUsername;
	usernameList.push(socket.username);
	io.emit('user list update', usernameList);
	socket.emit('username', socket.username);

	//Load history message record from DB and display to all the new users
	MessageRecord.find(function(err, historyMessages) {
		if (err) {
			return console.log(err);
		}
		io.emit('history messages', historyMessages);
	});

	//Update the chat box when a user post a new messaage and finish the persistence operation 
	socket.on('chat message', function(newMessage) {
		var currentTime = new Date();
		var newMessageRecord = new MessageRecord({name: socket.username, time: currentTime, message: newMessage});
		io.emit('chat message', newMessageRecord);
		newMessageRecord.save(function (err, newMessageRecord) {
			if (err) return console.error(err);
		});
	});

	//Update the online userList when the user leave
	socket.on('disconnect', function() {
		var index = usernameList.indexOf(socket.username);
		usernameList.splice(index, 1);
		io.emit('user list update', usernameList);
	});
});

http.listen(3000, function() {
	console.log('The server is listening on port 3000!');
});


