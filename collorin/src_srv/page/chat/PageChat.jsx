import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";
import "../../require/socket.io.jsx";

import "../../util/ContentsServer.jsx";
import "../../models/User.jsx";

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

// チャットページ
class PageChat{
	static var _sockets : SocketNamespace;
	static var _rcli : RedisClient;
	static const _rhead = "coll:chat:";

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient, io : SocketManager) : void{
		PageChat._sockets = io.of("chat");
		PageChat._rcli = rcli;

		// -------- ソケットdbデータリセット --------
		PageChat._rcli.keys([PageChat._rhead + "*"], function(err : variant, results : string[]) : void{
			for(var i = 0; i < results.length; i++){
				PageChat._rcli.del([results[i]], function(err : variant, result : Nullable.<string>) : void{});
			}
		});

		// -------- expressページ --------
		app.post("/chat", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var cont = {} : Map.<string>;

			// フィールド情報
			cont["img_grid"] = "/img/gridField/test.png";
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

			// 背景画像
			jdat["background"] = "test";
			cont["img_background_test"] = "/img/background/test.png";

			var codeList = [
				"player0",
				"player1",
				"player2",
				"player3",
				"enemy1",
				"enemy2",
				"enemy3",
			];

			// ユーザー情報の作成
			var uinfo = new ChatUserInfo({
				room: "room0",
				code: codeList[Math.floor(Math.random() * codeList.length)],
				name: req.user.nickname,
				x: Math.floor(16 * Math.random()),
				y: Math.floor(16 * Math.random()),
				r: Math.floor(8 * Math.random()),
				serif: "",
			});

			// ユーザー情報の設定
			PageChat._setUinfo(req.session.passport["user"] as string, uinfo, function(){
				jdat["contents"] = ContentsServer.convertAddress(cont);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			});
		});

		// -------- socket.io接続 --------
		PageChat._sockets.on("connection", function(client : Socket) : void{
			var uinfo : ChatUserInfo = null;

			// 接続開始時
			client.on("entry", function() : void{
				var newData : variant = null;
				var allData = new variant[];
				var newCont = {} : Map.<string>;
				var allCont = {} : Map.<string>;
				var step = {} : Map.<function():void>;
				step["start"] = function() : void{step["getuinfo"]();};
				// ユーザー情報の確認
				step["getuinfo"] = function() : void{
					PageChat._rcli.get([PageChat._rhead + "uid:" + client.handshake.session.passport["user"] as string], function(err : variant, result : Nullable.<string>) : void{
						PageChat._rcli.get([PageChat._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
							uinfo = new ChatUserInfo(JSON.parse(result));
							step["setuinfo"]();
						});
					});
				};
				// ユーザー情報をルームに登録
				step["setuinfo"] = function() : void{PageChat._rcli.sadd([PageChat._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{step["member"]();});};
				// メンバー情報の確認
				step["member"] = function() : void{
					PageChat._rcli.smembers([PageChat._rhead + "room:" + uinfo.room], function(err : variant, results : string[]) : void{
						var count = results.length;
						for(var i = 0; i < results.length; i++){
							PageChat._rcli.get([PageChat._rhead + "uinfo:" + results[i]], function(err : variant, result : Nullable.<string>) : void{
								// メンバー情報の形成
								var tmpdata = JSON.parse(result);
								tmpdata["motion"] = "human";
								tmpdata["size"] = 1.2;
								delete tmpdata["room"];
								// 画像情報の確認
								var tmpCont = {} : Map.<string>;
								var code = tmpdata["code"] as string;
								tmpCont["img_chara_dot_" + code] = "/img/character/" + code + "/dot.png";
								tmpCont["img_chara_bust_" + code] = "/img/character/" + code + "/bust.png";
								// 情報の一時保存
								allData.push(tmpdata);
								for(var tag in tmpCont){allCont[tag] = tmpCont[tag];}
								if(uinfo.uid == tmpdata["uid"]){
									newData = tmpdata;
									for(var tag in tmpCont){newCont[tag] = tmpCont[tag];}
								}
								if(--count == 0){step["send"]();}
							});
						}
					});
				};
				// データの送信
				step["send"] = function() : void{
					client.join(uinfo.room);
					client.emit("entry", uinfo.uid, allData, ContentsServer.convertAddress(allCont));
					client.broadcast.to(uinfo.room).emit("add", newData, ContentsServer.convertAddress(newCont));
				};
				// プログラムステップ開始
				step["start"]();
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
				PageChat._rcli.set([PageChat._rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{});
			});

			// 台詞受信時
			client.on("talk", function(serif : variant) : void{
				if(uinfo == null){return;}
				uinfo.serif = serif as string;
				if(uinfo.serif.length > 20){uinfo.serif = uinfo.serif.substring(0, 20);}
				// 台詞データ送信
				PageChat._sockets.to(uinfo.room).emit("talk", uinfo.uid, uinfo.serif);
				// 台詞データ保存
				PageChat._rcli.set([PageChat._rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{});
			});

			// 自分ユーザーデータの削除
			client.on("disconnect", function() : void{
				if(uinfo == null){return;}
				PageChat._removeUinfo(uinfo);
				uinfo = null;
			});
		});
	}

	// ----------------------------------------------------------------
	// ユーザー情報の登録
	static function _setUinfo(sessionID : string, uinfo : ChatUserInfo, callback : function():void) : void{
		// ソケット情報の作成
		var step = {} : Map.<function():void>;
		step["start"] = function() : void{step["getuid"]();};
		// UIDの発行
		step["getuid"] = function() : void{
			PageChat._rcli.incr([PageChat._rhead + "nextUserId"], function(err : variant, result : Nullable.<string>) : void{
				uinfo.uid = result;
				step["setuid"]();
			});
		};
		// UIDの登録と同時に古い情報があったら削除
		step["setuid"] = function() : void{
			PageChat._rcli.getset([PageChat._rhead + "uid:" + sessionID, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{
				if(result != null){
					PageChat._rcli.get([PageChat._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
						if(result == null){return;}
						PageChat._removeUinfo(new ChatUserInfo(JSON.parse(result)));
					});
				}
				step["setuinfo"]();
			});
		};
		// キャラクター情報登録
		step["setuinfo"] = function() : void{
			PageChat._rcli.set([PageChat._rhead + "uinfo:" + uinfo.uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{
				callback();
			});
		};
		// プログラムステップ開始
		step["start"]();
	}

	// ----------------------------------------------------------------
	// ユーザー情報の削除
	static function _removeUinfo(uinfo : ChatUserInfo) : void{
		PageChat._sockets.to(uinfo.room).emit("kill", uinfo.uid);
		PageChat._rcli.srem([PageChat._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
		PageChat._rcli.del([PageChat._rhead + "uinfo:" + uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
	}
}

