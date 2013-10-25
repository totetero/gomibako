var http = require("http");
var socketio = require('socket.io');
var io = null;

// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(srv){
	io = socketio.listen(srv);

	io.configure(function(){
		io.set('authorization', function(handshakeData, callback){
			console.log("認証成功DAYO!!");
			callback(null, true);
		});
	});

	io.sockets.on('connection', function(client){
		console.log('接続', client.handshake);
	});
}

