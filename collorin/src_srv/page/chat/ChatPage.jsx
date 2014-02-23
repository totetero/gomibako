import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";
import "../../require/socket.io.jsx";

import "../../models/User.jsx";
import "../../data/CharacterDrawInfo.jsx";

class ChatUserInfo{
	var uid : string;
	var room : string;
	var code : string;
	var name : string;
	var x : int;
	var y : int;
	var r : int;
	var serif : string;
	// コンストラクタ
	function constructor(dat : variant) {
		this.uid = dat["uid"] as string;
		this.room = dat["room"] as string;
		this.code = dat["code"] as string;
		this.name = dat["name"] as string;
		this.x = dat["x"] as int;
		this.y = dat["y"] as int;
		this.r = dat["r"] as int;
		this.serif = dat["serif"] as string;
	}
}

// マイページ
class ChatPage{
	static var _sockets : SocketNamespace;
	static var _rcli : RedisClient;
	static const _rhead = "chat:";

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient, io : SocketManager) : void{
		ChatPage._sockets = io.of("chat");
		ChatPage._rcli = rcli;

		// -------- ソケットdbデータリセット --------
		ChatPage._rcli.keys([ChatPage._rhead + "*"], function(err : variant, results : string[]) : void{
			for(var i = 0; i < results.length; i++){
				ChatPage._rcli.del([results[i]], function(err : variant, result : Nullable.<string>) : void{});
			}
		});

		// -------- expressページ --------
		app.post("/chat", function(req : ExRequest, res : ExResponse, next : function():void) : void{
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

			// ユーザー情報の作成
			var uinfo = new ChatUserInfo({
				room: "room0",
				code: "player0",
				name: req.user.nickname,
				x: Math.floor(16 * Math.random()),
				y: Math.floor(16 * Math.random()),
				r: Math.floor(8 * Math.random()),
				serif: "",
			});

			// ユーザー情報の設定
			ChatPage._setUinfo(req.session.passport["user"] as string, uinfo, function(){
				jdat["imgs"] = imgs;
				res.contentType("application/json").send(JSON.stringify(jdat));
			});
		});

		// -------- socket.io接続 --------
		ChatPage._sockets.on("connection", function(client : Socket) : void{
			var uinfo : ChatUserInfo = null;

			// 接続開始時
			client.on("entry", function() : void{
				var newData : variant = null;
				var allData = new variant[];
				var newImgs = {} : Map.<string>;
				var allImgs = {} : Map.<string>;
				var step = {} : Map.<function():void>;
				// ユーザー情報の確認
				step["getuinfo"] = function() : void{
					ChatPage._rcli.get([ChatPage._rhead + "uid:" + client.handshake.session.passport["user"] as string], function(err : variant, result : Nullable.<string>) : void{
						ChatPage._rcli.get([ChatPage._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
							uinfo = new ChatUserInfo(JSON.parse(result));
							step["setuinfo"]();
						});
					});
				};
				// ユーザー情報をルームに登録
				step["setuinfo"] = function() : void{ChatPage._rcli.sadd([ChatPage._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{step["member"]();});};
				// メンバー情報の確認
				step["member"] = function() : void{
					ChatPage._rcli.smembers([ChatPage._rhead + "room:" + uinfo.room], function(err : variant, results : string[]) : void{
						var count = results.length;
						for(var i = 0; i < results.length; i++){
							ChatPage._rcli.get([ChatPage._rhead + "uinfo:" + results[i]], function(err : variant, result : Nullable.<string>) : void{
								// メンバー情報の形成
								var tmpdata = JSON.parse(result);
								tmpdata["drawInfo"] = CharacterDrawInfo.data["human"];
								tmpdata["size"] = 1.2;
								delete tmpdata["room"];
								// 画像情報の確認
								var tmpimgs = {} : Map.<string>;
								var code = tmpdata["code"] as string;
								tmpimgs["dot_" + code] = "img/character/" + code + "/dot.png";
								tmpimgs["b64_bust_" + code] = "img/character/" + code + "/bust.png";
								// 情報の一時保存
								allData.push(tmpdata);
								for(var tag in tmpimgs){allImgs[tag] = tmpimgs[tag];}
								if(uinfo.uid == tmpdata["uid"]){
									newData = tmpdata;
									for(var tag in tmpimgs){newImgs[tag] = tmpimgs[tag];}
								}
								if(--count == 0){step["send"]();}
							});
						}
					});
				};
				// データの送信
				step["send"] = function() : void{
					client.join(uinfo.room);
					client.emit("entry", uinfo.uid, allData, allImgs);
					client.broadcast.to(uinfo.room).emit("add", newData, newImgs);
				};
				// プログラムステップ開始
				step["getuinfo"]();
			});

			// 位置受信時
			client.on("walk", function(dst : variant) : void{
				if(uinfo == null){return;}
				uinfo.x = dst[0] as int;
				uinfo.y = dst[1] as int;
				uinfo.r = dst[2] as int;
				// 位置データ送信
				client.broadcast.to(uinfo.room).emit("walk", uinfo.uid, [uinfo.x, uinfo.y, uinfo.r]);
				// 位置データ保存
				ChatPage._rcli.set([ChatPage._rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{});
			});

			// 台詞受信時
			client.on("talk", function(serif : variant) : void{
				if(uinfo == null){return;}
				uinfo.serif = serif as string;
				if(uinfo.serif.length > 20){uinfo.serif = uinfo.serif.substring(0, 20);}
				// 台詞データ送信
				ChatPage._sockets.to(uinfo.room).emit("talk", uinfo.uid, uinfo.serif);
				// 台詞データ保存
				ChatPage._rcli.set([ChatPage._rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{});
			});

			// 自分ユーザーデータの削除
			client.on("disconnect", function() : void{
				if(uinfo == null){return;}
				ChatPage._removeUinfo(uinfo);
				uinfo = null;
			});
		});
	}

	// ----------------------------------------------------------------
	// ユーザー情報の登録
	static function _setUinfo(sessionID : string, uinfo : ChatUserInfo, callback : function():void) : void{
		// ソケット情報の作成
		var uid = "";
		var step = {} : Map.<function():void>;
		// UIDの発行
		step["getuid"] = function() : void{
			ChatPage._rcli.incr([ChatPage._rhead + "nextUserId"], function(err : variant, result : Nullable.<string>) : void{
				uid = result;
				step["olduid"]();
				step["setuinfo"]();
			});
		};
		// 古い情報があったら削除
		step["olduid"] = function() : void{
			ChatPage._rcli.getset([ChatPage._rhead + "uid:" + sessionID, uid], function(err : variant, result : Nullable.<string>) : void{
				if(result == null){return;}
				ChatPage._rcli.get([ChatPage._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
					if(result == null){return;}
					ChatPage._removeUinfo(new ChatUserInfo(JSON.parse(result)));
				});
			});
		};
		// キャラクター情報登録
		step["setuinfo"] = function() : void{
			uinfo.uid = uid;
			ChatPage._rcli.set([ChatPage._rhead + "uinfo:" + uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{
				callback();
			});
		};
		// プログラムステップ開始
		step["getuid"]();
	}

	// ----------------------------------------------------------------
	// ユーザー情報の削除
	static function _removeUinfo(uinfo : ChatUserInfo) : void{
		ChatPage._sockets.to(uinfo.room).emit("kill", uinfo.uid);
		ChatPage._rcli.srem([ChatPage._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
		ChatPage._rcli.del([ChatPage._rhead + "uinfo:" + uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
	}
}

