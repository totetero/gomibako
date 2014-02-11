import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../require/redis.jsx";
import "../require/socket.io.jsx";

import "../models/User.jsx";
import "../data/CharacterDrawInfo.jsx";

class ChatUserInfo{
	var uid : string;
	var room : string;
	var code : string;
	var x : number;
	var y : number;
	var r : number;
	var serif : string;
	// コンストラクタ
	function constructor(dat : variant) {
		this.uid = dat["uid"] as string;
		this.room = dat["room"] as string;
		this.code = dat["code"] as string;
		this.x = dat["x"] as number;
		this.y = dat["y"] as number;
		this.r = dat["r"] as number;
		this.serif = dat["serif"] as string;
    }
}

// マイページ
class ChatPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient, io : SocketManager) : void{
		// -------- ソケットdbデータリセット --------
		var rhead = "chat:";
		rcli.keys([rhead + "*"], function(err : variant, results : string[]) : void{
			for(var i = 0; i < results.length; i++){
				rcli.del([results[i]], function(err : variant, result : string) : void{});
			}
		});

		// -------- expressページ --------
		app.get("/chat", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var imgs = {} : Map.<string>;

			// フィールド情報
			imgs["grid"] = "img/gridField/test.png";
			jdat["grid"] = [
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,1],
				[1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1],
				[1,1,3,3,3,1,1,1,1,1,1,3,3,3,1,1],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1],
				[1,1,3,3,1,1,1,0,0,1,1,1,3,3,1,1],
				[1,1,3,3,1,1,1,0,0,1,1,1,3,3,1,1],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1],
				[1,1,3,3,3,1,1,1,1,1,1,3,3,3,1,1],
				[1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1],
				[1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,1],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			];

			// test
			imgs["dot_player0"] = "img/character/player0/dot.png";
			jdat["imgs"] = imgs;

			// IDの発行
			rcli.incr([rhead + "nextUserId"], function(err : variant, result : string) : void{
				// セッションとIDの結び付け
				rcli.set([rhead + "uid:" + req.session.passport["user"] as string, result], function(err : variant, result : string) : void{});
				// キャラクター情報
				rcli.set([rhead + "uinfo:" + result, JSON.stringify(new ChatUserInfo({
					uid: result,
					room: "room0",
					code: "player0",
					x: Math.floor(16 * Math.random()) * 16 + 8,
					y: Math.floor(16 * Math.random()) * 16 + 8,
					r: Math.PI * 2 * Math.random(),
					serif: "",
				}))], function(err : variant, result : string) : void{
					res.send(JSON.stringify(jdat));
				});
			});
		});

		// -------- socket.io接続 --------
		var sockets = io.of("chat");
		sockets.on("connection", function(client : Socket) : void{
			var uinfo : ChatUserInfo = null;

			// 接続開始時
			client.on("entry", function() : void{
				var data : variant = null;
				var dataList = new variant[];
				var step = {} : Map.<function():void>;
				// ユーザー情報の確認
				step["getuinfo"] = function() : void{
					rcli.get([rhead + "uid:" + client.handshake.session.passport["user"] as string], function(err : variant, result : string) : void{
						rcli.get([rhead + "uinfo:" + result], function(err : variant, result : string) : void{
							uinfo = new ChatUserInfo(JSON.parse(result));
							step["setuinfo"]();
						});
					});
				};
				// ユーザー情報の登録
				step["setuinfo"] = function() : void{rcli.sadd([rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : string) : void{step["member"]();});};
				// メンバー情報の確認
				step["member"] = function() : void{
					rcli.smembers([rhead + "room:" + uinfo.room], function(err : variant, results : string[]) : void{
						var count = results.length;
						for(var i = 0; i < results.length; i++){
							rcli.get([rhead + "uinfo:" + results[i]], function(err : variant, result : string) : void{
								// メンバー情報の形成
								var temp = JSON.parse(result);
								temp["drawInfo"] = CharacterDrawInfo.data["human"];
								temp["size"] = 1.2;
								delete temp["room"];
								dataList.push(temp);
								if(uinfo.uid == temp["uid"]){data = temp;}
								if(--count == 0){step["send"]();}
							});
						}
					});
				};
				// データの送信
				step["send"] = function() : void{
					client.join(uinfo.room);
					client.emit("entry", uinfo.uid, dataList);
					client.broadcast.to(uinfo.room).emit("add", data);
				};
				// プログラムステップ開始
				step["getuinfo"]();
			});

			// 台詞受信時
			client.on("talk", function(str : variant) : void{
				// 台詞データ送信
				sockets.to(uinfo.room).emit("talk", uinfo.uid, str);
				// 台詞データ保存
				uinfo.serif = str as string;
				rcli.set([rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : string) : void{});
			});

			// 自分ユーザーデータの削除
			client.on("disconnect", function() : void{
				client.broadcast.to(uinfo.room).emit("kill", uinfo.uid);
				rcli.srem([rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : string) : void{});
				rcli.del([rhead + "uinfo:" + uinfo.uid], function(err : variant, result : string) : void{});
				rcli.del([rhead + "uid:" + client.handshake.session.passport["user"] as string], function(err : variant, result : string) : void{});
			});
		});
	}
}

