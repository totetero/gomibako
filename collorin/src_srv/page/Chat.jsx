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
			var id = "player0";
			imgs["dot_" + id] = "img/character/" + id + "/dot.png";
			jdat["charaInfo"] = {
				id: id,
				drawInfo: CharacterDrawInfo.data["human"],
				size: 1.2,
				x: Math.floor(16 * Math.random()) * 16 + 8,
				y: Math.floor(16 * Math.random()) * 16 + 8,
				r: Math.PI * 0.5
			};

			jdat["imgs"] = imgs;
			res.send(JSON.stringify(jdat));
		});

		// test
		rcli.set(["hoge", "1"], function(err : variant, result : string) : void{log result;});
		rcli.get(["hoge"], function(err : variant, result : string) : void{log result;});
		rcli.incr(["hoge"], function(err : variant, result : string) : void{log result;});

		// -------- socket.io接続 --------
		io.of("chat").on("connection", function(client : Socket) : void{
			var uinfo_id : string = "";
			var uinfo_room : string = "";
			
			client.on("entry", function(room : variant, charaInfo : variant) : void{
				uinfo_id = client.id;
				uinfo_room = room as string;
				rcli.sadd(["chat:" + uinfo_room, uinfo_id], function(err : variant, result : string) : void{});
				rcli.incr(["chat:nextUserId"], function(err : variant, result : string) : void{
					client.emit("entry", result);
				});
			});

			client.on("disconnect", function() : void{
				rcli.srem(["chat:" + uinfo_room, uinfo_id], function(err : variant, result : string) : void{});
			});
		});
	}
}

