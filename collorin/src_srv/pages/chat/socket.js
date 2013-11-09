var http = require("http");
var socketio = require("socket.io");
var connect = require("express/node_modules/connect")
var cookiemod = require("express/node_modules/cookie");

// データベースモデル
var UserModel = require("../../models/user").UserModel;

exports.init = function(app, srv, store){
	var io = socketio.listen(srv);
	var users = {}

	// -------------------------------- socket.io設定
	io.configure(function(){
		io.enable("browser client minification");
		io.set("authorization", function(handshakeData, callback){
			// 認証
			var cookie = handshakeData.headers.cookie;
			var cookie = cookiemod.parse(decodeURIComponent(cookie));
			var sessionID = connect.utils.parseSignedCookie(cookie["connect.sid"], app.get("secretKey"));
			if(cookie){
				console.log("認証成功DAYO!!");
				callback(null, true);
			}else{
				callback("Cookie が見つかりませんでした", false);
			}
		});
	});

	// -------------------------------- socket.io接続
	io.sockets.on("connection", function(client){
		var uinfo = null;

		// -------- ユーザー情報受信
		client.on("entry", function(cookie, room){
			// 認証
			var cookie = cookiemod.parse(decodeURIComponent(cookie));
			var sessionID = connect.utils.parseSignedCookie(cookie["connect.sid"], app.get("secretKey"));
			store.get(sessionID, function(err, session){
				if(err){client.disconnect(); return;}
				UserModel.findById(session.passport.user, function(err, user){
					if(err){client.disconnect(); return;}
					// ユーザー作成
					uinfo = {};
					uinfo.id = client.id;
					uinfo.name = user.uname;
					uinfo.room = room;
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
			});
		});

		// -------- 目的地受信
		client.on("dst", function(x, y){
			if(!uinfo){return;}
			uinfo.dstx = x;
			uinfo.dsty = y;
			io.sockets.to(uinfo.room).emit("move", uinfo.id, uinfo.dstx, uinfo.dsty);
		});

		// -------- 台詞受信
		client.on("str", function(str){
			if(!uinfo){return;}
			uinfo.serif = str;
			io.sockets.to(uinfo.room).emit("talk", uinfo.id, uinfo.serif);
		});

		// -------- 切断された時
		client.on('disconnect', function(){
			if(!uinfo){return;}
			delete users[uinfo.room][uinfo.id];
			client.broadcast.to(uinfo.room).emit("kill", uinfo.id);
		});
	});
}

