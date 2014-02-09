import 'timer.jsx';

import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../require/mongo.jsx";
import "../require/redis.jsx";
import "../require/socket.io.jsx";
import "../zzz_util_old/File.jsx";

import "../models/User.jsx";

class ChatUserPrivateInfo{
	var id : string;
	var room : string;
	var heartbeatCounter : int;
}

class ChatUserPublicInfo{
	var name : string;
	var imgname : string;
	var dstx : int;
	var dsty : int;
	var serif : string;
}

// チャットページ
class ChatPage{
	// ----------------------------------------------------------------
	// ソケットの設定
	static function setSocket(app : ExApplication, srv : HTTPServer, store : RedisStore) : void{
		var io = SocketIO.listen(srv);
		var users = {} : Map.<Map.<ChatUserPublicInfo>>;

		// -------------------------------- socket.io設定
		io.configure(function() : void{
			io.enable("browser client minification");
			io.set("authorization", function(handshakeData : variant, callback : function(err:variant,success:boolean):void) : void{
				// 認証
				var cookie = handshakeData["headers"]["cookie"] as string;
				//var cookie = SocketUtil.parse1(String.decodeURIComponent(cookie))["connect.sid"];
				//var sessionID = SocketUtil.parse2(cookie, app.get("secretKey") as string);
				if(cookie){
					log "認証成功DAYO!!";
					callback(null, true);
				}else{
					callback("Cookie が見つかりませんでした", false);
				}
			});
		});

		// -------------------------------- socket.io接続
		io.sockets.on("connection", function(client : Socket) : void{
			var uinfo1 : ChatUserPrivateInfo = null;
			var uinfo2 : ChatUserPublicInfo = null;
			var maxx = 510;
			var maxy = 510;

			// -------- ユーザー情報受信
			client.on("entry", function(arg_cookie : variant, arg_room : variant, arg_imgname : variant) : void{
				// 認証
				var cookie = SocketUtil.parse1(String.decodeURIComponent(arg_cookie as string))["connect.sid"];
				var sessionID = SocketUtil.parse2(cookie, app.get("secretKey") as string);
				store.get(sessionID, function(err : variant, session : ExSession) : void{
					if(err){client.disconnect(); return;}
					UserModel.findById(session.passport["user"] as string, function(err : variant, user : UserModel) : void{
						if(err){client.disconnect(); return;}
						// ユーザー作成 プライベート情報
						uinfo1 = new ChatUserPrivateInfo();
						uinfo1.id = client.id;
						uinfo1.room = arg_room as string;
						uinfo1.heartbeatCounter = 0;
						// ユーザー作成 パブリック情報
						uinfo2 = new ChatUserPublicInfo();
						uinfo2.name = user.uname;
						uinfo2.imgname = arg_imgname as string;
						uinfo2.dstx = Math.floor(maxx * Math.random() * 10) / 10;
						uinfo2.dsty = Math.floor(maxy * Math.random() * 10) / 10;
						uinfo2.serif = "";
						// 部屋作成
						if(users[uinfo1.room] == null){users[uinfo1.room] = new Map.<ChatUserPublicInfo>;}
						users[uinfo1.room][uinfo1.id] = uinfo2;
						client.join(uinfo1.room);
						// 情報送信
						client.emit("entry", uinfo1.id, users[uinfo1.room]);
						client.broadcast.to(uinfo1.room).emit("add", {
							id: uinfo1.id,
							name: uinfo2.name,
							imgname: uinfo2.imgname,
							dstx: uinfo2.dstx,
							dsty: uinfo2.dsty
						});
					});
				});
			});

			// -------- 切断された時
			var disconnect = function() : void{
				if(!uinfo1){return;}
				client.broadcast.to(uinfo1.room).emit("kill", uinfo1.id);
				delete users[uinfo1.room][uinfo1.id];
				uinfo1 = null;
				uinfo2 = null;
			};
			client.on('disconnect', disconnect);

			// -------- ハートビート
			var heartbeatCheck = function() : void{
				if(!uinfo1){return;}
				if(uinfo1.heartbeatCounter++ < 3){
					// 生存確認送信
					client.volatile.emit("heartbeat");
					Timer.setTimeout(heartbeatCheck, 1000);
				}else{
					// 切断
					disconnect();
					client.disconnect();
				}
			};
			Timer.setTimeout(heartbeatCheck, 1000);
			client.on("heartbeat", function() : void{
				if(!uinfo1){return;}
				// 生存確認受信
				uinfo1.heartbeatCounter = 0;
			});

			// -------- 目的地受信
			client.on("dst", function(arg_x : variant, arg_y : variant) : void{
				var x = arg_x as number;
				var y = arg_y as number;
				if(!uinfo1){return;}
				if(x < 0){x = 0;}else if(x > maxx){x = maxx;}
				if(y < 0){y = 0;}else if(y > maxy){y = maxy;}
				uinfo2.dstx = x;
				uinfo2.dsty = y;
				io.sockets.to(uinfo1.room).emit("move", uinfo1.id, uinfo2.dstx, uinfo2.dsty);
			});

			// -------- 台詞受信
			client.on("str", function(arg_str : variant) : void{
				if(!uinfo1){return;}
				uinfo2.serif = arg_str as string;
				io.sockets.to(uinfo1.room).emit("talk", uinfo1.id, uinfo2.serif);
			});
		});
	}

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// チャットページ
		app.get("/chat", function(req : ExRequest, res : ExResponse, next : function():void){
			var jdat = {} : Map.<variant>;
			var js = new string[];
        
			js.push("./src_cli_old/chat/jsx/chat.js");
			js.push("./src_cli_old/chat/js/init.js");
        
			new FileUtilJsonData(js, null, null, null, function(data : FileUtilJsonData){
				jdat["js"] = data.js;
				jdat["css"] = new string[];
				res.render("common/index.ejs", {title: "チャット", daturl: "/chat/getdat", jdat: JSON.stringify(jdat)});
			});
		});

		// チャットページ
		app.get("/chat/getdat", function(req : ExRequest, res : ExResponse, next : function():void){
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;

			var imgname : string = "";
			switch(Math.floor(Math.random() * 6)){
				case 0: imgname = "player1"; break;
				case 1: imgname = "player2"; break;
				case 2: imgname = "player3"; break;
				case 3: imgname = "enemy1"; break;
				case 4: imgname = "enemy2"; break;
				case 5: imgname = "enemy3"; break;
			}
			jdat["imgname"] = imgname;
			imgs[imgname] = "./src_cli_old/common/img/character/" + imgname + "/dot.png";
			
			// TEST いったん全画像送る
			imgs["player1"] = "./src_cli_old/common/img/character/player1/dot.png";
			imgs["player2"] = "./src_cli_old/common/img/character/player2/dot.png";
			imgs["player3"] = "./src_cli_old/common/img/character/player3/dot.png";
			imgs["enemy1"] = "./src_cli_old/common/img/character/enemy1/dot.png";
			imgs["enemy2"] = "./src_cli_old/common/img/character/enemy2/dot.png";
			imgs["enemy3"] = "./src_cli_old/common/img/character/enemy3/dot.png";
        
			// ゲーム動的情報
			new FileUtilJsonData(null, null, imgs, null, function(data : FileUtilJsonData){
				jdat["imgs"] = data.imgs;
				res.contentType('application/json');
				res.send(JSON.stringify(jdat));
			});
		});

		// チャット画像請求
		app.get("/chat", function(req : ExRequest, res : ExResponse, next : function():void){
			log req;
		});
	}
}

