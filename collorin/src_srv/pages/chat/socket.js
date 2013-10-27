var http = require("http");
var socketio = require("socket.io");
var io = null;

// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(io){
	var users = {}

	io.sockets.on("connection", function(client){
		//console.log("接続", client.handshake);

		var uinfo = null;

		// -------- ユーザー情報受信
		client.on("entry", function(name){
			// ユーザー作成
			uinfo = {};
			uinfo.id = client.id;
			uinfo.name = name;
			uinfo.room = "room0";
			uinfo.dstx = Math.floor(100 * Math.random() * 10) / 10;
			uinfo.dsty = Math.floor(100 * Math.random() * 10) / 10;
			uinfo.serif = "";
			// 部屋作成
			if(!users[uinfo.room]){users[uinfo.room] = {};}
			users[uinfo.room][uinfo.id] = uinfo;
			client.join(uinfo.room);
			// 情報送信
			client.emit("entry", uinfo.id, users[uinfo.room])
			client.broadcast.to(uinfo.room).emit("add", uinfo.id, uinfo.name, uinfo.dstx, uinfo.dsty);
		});

		// -------- 目的地受信
		client.on("dst", function(x, y){
			uinfo.dstx = x;
			uinfo.dsty = y;
			io.sockets.to(uinfo.room).emit("move", uinfo.id, uinfo.dstx, uinfo.dsty);
		});

		// -------- 台詞受信
		client.on("str", function(str){
			uinfo.serif = str;
			io.sockets.to(uinfo.room).emit("talk", uinfo.id, uinfo.serif);
		});

		// -------- 切断された時
		client.on('disconnect', function(){
			delete users[uinfo.room][uinfo.id];
			client.broadcast.to(uinfo.room).emit("kill", uinfo.id);
		});
	});
}

