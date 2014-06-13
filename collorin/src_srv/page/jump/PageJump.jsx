import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";
import "../../require/socket.io.jsx";

import "../../util/ContentsServer.jsx";
import "../../models/User.jsx";

class JumpUserInfo{
	var uid : string;
	var room : string;
	var code : string;
	var name : string;
	// コンストラクタ
	function constructor(dat : variant) {
		this.uid = dat["uid"] as string;
		this.room = dat["room"] as string;
		this.code = dat["code"] as string;
		this.name = dat["name"] as string;
	}
}

// ジャンプページ
class PageJump{
	static var _sockets : SocketNamespace;
	static var _rcli : RedisClient;
	static const _rhead = "old_jump:";

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient, io : SocketManager) : void{
		PageJump._sockets = io.of("jump");
		PageJump._rcli = rcli;

		// -------- ソケットdbデータリセット --------
		PageJump._rcli.keys([PageJump._rhead + "*"], function(err : variant, results : string[]) : void{
			for(var i = 0; i < results.length; i++){
				PageJump._rcli.del([results[i]], function(err : variant, result : Nullable.<string>) : void{});
			}
		});

		// -------- expressページ --------
		app.get("/jump", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var cont = {} : Map.<string>;

			// test
			cont["img_chara_dot_player1"] = "/img/character/player1/dot.png";
			cont["img_chara_dot_player2"] = "/img/character/player2/dot.png";
			cont["img_chara_dot_player3"] = "/img/character/player3/dot.png";
			cont["img_foothold_test"] = "/img/foothold/test.png";

			// 背景画像
			jdat["background"] = "test";
			cont["img_background_test"] = "/img/background/test.png";

			// ユーザー情報の作成
			var uinfo = new JumpUserInfo({
				room: "room0",
				code: "player1",
				name: req.user.nickname,
			});

			// ユーザー情報の設定
			PageJump._setUinfo(req.session.passport["user"] as string, uinfo, function(){
				jdat["contents"] = ContentsServer.convertAddress(cont);
				res.setHeader("Content-Type", "application/json");
				res.setHeader("cache-control", "no-cache");
				res.send(JSON.stringify(jdat));
			});
		});

		// -------- socket.io接続 --------
		PageJump._sockets.on("connection", function(client : Socket) : void{
			var uinfo : JumpUserInfo = null;

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
					PageJump._rcli.get([PageJump._rhead + "uid:" + client.handshake.session.passport["user"] as string], function(err : variant, result : Nullable.<string>) : void{
						PageJump._rcli.get([PageJump._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
							uinfo = new JumpUserInfo(JSON.parse(result));
							step["setuinfo"]();
						});
					});
				};
				// ユーザー情報をルームに登録
				step["setuinfo"] = function() : void{PageJump._rcli.sadd([PageJump._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{step["member"]();});};
				// メンバー情報の確認
				step["member"] = function() : void{
					PageJump._rcli.smembers([PageJump._rhead + "room:" + uinfo.room], function(err : variant, results : string[]) : void{
						var count = results.length;
						for(var i = 0; i < results.length; i++){
							PageJump._rcli.get([PageJump._rhead + "uinfo:" + results[i]], function(err : variant, result : Nullable.<string>) : void{
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

			// 自分ユーザーデータの削除
			client.on("disconnect", function() : void{
				if(uinfo == null){return;}
				PageJump._removeUinfo(uinfo);
				uinfo = null;
			});
		});
	}

	// ----------------------------------------------------------------
	// ユーザー情報の登録
	static function _setUinfo(sessionID : string, uinfo : JumpUserInfo, callback : function():void) : void{
		// ソケット情報の作成
		var uid = "";
		var step = {} : Map.<function():void>;
		step["start"] = function() : void{step["getuid"]();};
		// UIDの発行
		step["getuid"] = function() : void{
			PageJump._rcli.incr([PageJump._rhead + "nextUserId"], function(err : variant, result : Nullable.<string>) : void{
				uid = result;
				step["setuid"]();
			});
		};
		// UIDの登録と同時に古い情報があったら削除
		step["setuid"] = function() : void{
			PageJump._rcli.getset([PageJump._rhead + "uid:" + sessionID, uid], function(err : variant, result : Nullable.<string>) : void{
				if(result != null){
					PageJump._rcli.get([PageJump._rhead + "uinfo:" + result], function(err : variant, result : Nullable.<string>) : void{
						if(result == null){return;}
						PageJump._removeUinfo(new JumpUserInfo(JSON.parse(result)));
					});
				}
				step["setuinfo"]();
			});
		};
		// キャラクター情報登録
		step["setuinfo"] = function() : void{
			uinfo.uid = uid;
			PageJump._rcli.set([PageJump._rhead + "uinfo:" + uid, JSON.stringify(uinfo)], function(err : variant, result : Nullable.<string>) : void{
				callback();
			});
		};
		// プログラムステップ開始
		step["start"]();
	}

	// ----------------------------------------------------------------
	// ユーザー情報の削除
	static function _removeUinfo(uinfo : JumpUserInfo) : void{
		PageJump._sockets.to(uinfo.room).emit("kill", uinfo.uid);
		PageJump._rcli.srem([PageJump._rhead + "room:" + uinfo.room, uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
		PageJump._rcli.del([PageJump._rhead + "uinfo:" + uinfo.uid], function(err : variant, result : Nullable.<string>) : void{});
	}
}

