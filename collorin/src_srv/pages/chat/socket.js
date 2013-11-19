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
		var uinfo1 = null;
		var uinfo2 = null;
		var maxx = 510;
		var maxy = 510;

		// -------- ユーザー情報受信
		client.on("entry", function(cookie, room, imgname){
			// 認証
			var cookie = cookiemod.parse(decodeURIComponent(cookie));
			var sessionID = connect.utils.parseSignedCookie(cookie["connect.sid"], app.get("secretKey"));
			store.get(sessionID, function(err, session){
				if(err){client.disconnect(); return;}
				UserModel.findById(session.passport.user, function(err, user){
					if(err){client.disconnect(); return;}
					// ユーザー作成 プライベート情報
					uinfo1 = {};
					uinfo1.id = client.id;
					uinfo1.room = room;
					uinfo1.heartbeatCounter = 0;
					// ユーザー作成 パブリック情報
					uinfo2 = {};
					uinfo2.name = user.uname;
					uinfo2.imgname = imgname;
					uinfo2.dstx = Math.floor(maxx * Math.random() * 10) / 10;
					uinfo2.dsty = Math.floor(maxy * Math.random() * 10) / 10;
					uinfo2.serif = "";
					// 部屋作成
					if(!users[uinfo1.room]){users[uinfo1.room] = {};}
					users[uinfo1.room][uinfo1.id] = uinfo2;
					client.join(uinfo1.room);
					// 情報送信
					client.emit("entry", uinfo1.id, users[uinfo1.room]);
					client.broadcast.to(uinfo1.room).emit("add", uinfo1.id, uinfo2.name, uinfo2.imgname, uinfo2.dstx, uinfo2.dsty);
				});
			});
		});

		// -------- 切断された時
		var disconnect = function(){
			if(!uinfo1){return;}
			client.broadcast.to(uinfo1.room).emit("kill", uinfo1.id);
			delete users[uinfo1.room][uinfo1.id];
			delete uinfo1;
			delete uinfo2;
		};
		client.on('disconnect', disconnect);

		// -------- ハートビート
		var heartbeatCheck = function(){
			if(!uinfo1){return;}
			if(uinfo1.heartbeatCounter++ < 3){
				// 生存確認送信
				client.emit("heartbeat");
				setTimeout(heartbeatCheck, 1000);
			}else{
				// 切断
				disconnect();
                client.disconnect();
			}
		};
		setTimeout(heartbeatCheck, 1000);
		client.on("heartbeat", function(){
			if(!uinfo1){return;}
			// 生存確認受信
			uinfo1.heartbeatCounter = 0;
		});

		// -------- 目的地受信
		client.on("dst", function(x, y){
			if(!uinfo1){return;}
			if(x < 0){x = 0;}else if(x > maxx){x = maxx;}
			if(y < 0){y = 0;}else if(y > maxy){y = maxy;}
			uinfo2.dstx = x;
			uinfo2.dsty = y;
			io.sockets.volatile.to(uinfo1.room).emit("move", uinfo1.id, uinfo2.dstx, uinfo2.dsty);
		});

		// -------- 台詞受信
		client.on("str", function(str){
			if(!uinfo1){return;}
			uinfo2.serif = str;
			io.sockets.to(uinfo1.room).emit("talk", uinfo1.id, uinfo2.serif);
		});
	});
}

