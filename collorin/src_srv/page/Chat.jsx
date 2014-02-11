import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../require/redis.jsx";
import "../require/socket.io.jsx";

import "../models/User.jsx";
import "../data/CharacterDrawInfo.jsx";

// マイページ
class ChatPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient, io : SocketManager) : void{
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

			// キャラクター情報
			var code = "player0";
			imgs["dot_" + code] = "img/character/" + code + "/dot.png";
			jdat["charaInfo"] = {
				code: code,
				x: Math.floor(16 * Math.random()) * 16 + 8,
				y: Math.floor(16 * Math.random()) * 16 + 8,
				r: Math.PI * 0.5
			};
			jdat["charaInfo"]["drawInfo"] = CharacterDrawInfo.data["human"];
			jdat["charaInfo"]["size"] = 1.2;

			jdat["imgs"] = imgs;
			res.send(JSON.stringify(jdat));
		});

		// -------- socket.io接続 --------
		io.of("chat").on("connection", function(client : Socket) : void{
			var uinfo_id : string = "";
			var uinfo_room : string = "";
			
			client.on("entry", function(room : variant, uinfo : variant) : void{
				var uinfoList = new variant[];
				var step = {} : Map.<function():void>;
				step["getid"] = function() : void{
					// 部屋情報の確認
					uinfo_room = room as string;
					client.join(uinfo_room);
					// ユーザーIDの発行
					rcli.incr(["chat:nextUserId"], function(err : variant, result : string) : void{
						uinfo_id = result;
						step["member"]();
					});
				};
				step["member"] = function() : void{
					// メンバーデータの確認
					rcli.smembers(["chat:" + uinfo_room], function(err : variant, results : string[]) : void{
						var count = results.length;
						if(count > 0){
							for(var i = 0; i < results.length; i++){
								if(uinfo_id != results[i]){
									rcli.get(["chat:uinfo:" + results[i]], function(err : variant, result : string) : void{
										// メンバーデータの形成
										var data = JSON.parse(result);
										data["drawInfo"] = CharacterDrawInfo.data["human"];
										data["size"] = 1.2;
										uinfoList.push(data);
										if(--count == 0){step["send"]();}
									});
								}
							}
						}else{
							step["send"]();
						}
					});
				};
				step["send"] = function() : void{
					// ユーザーデータの登録
					uinfo["id"] = uinfo_id;
					uinfo["serif"] = "";
					rcli.set(["chat:uinfo:" + uinfo_id, JSON.stringify(uinfo)], function(err : variant, result : string) : void{});
					rcli.sadd(["chat:" + uinfo_room, uinfo_id], function(err : variant, result : string) : void{});
					// ユーザーデータの形成
					uinfo["drawInfo"] = CharacterDrawInfo.data["human"];
					uinfo["size"] = 1.2;
					// データの送信
					client.emit("entry", uinfo_id, uinfoList);
					client.broadcast.to(uinfo_room).emit("add", uinfo);
				};
				step["getid"]();
			});

			client.on("disconnect", function() : void{
				// 自分ユーザーデータの削除
				client.broadcast.to(uinfo_room).emit("kill", uinfo_id);
				rcli.srem(["chat:" + uinfo_room, uinfo_id], function(err : variant, result : string) : void{});
				rcli.del(["chat:uinfo:" + uinfo_id], function(err : variant, result : string) : void{});
			});
		});
	}
}

