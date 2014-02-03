import "../require/nodejs.jsx";
import "../require/express.jsx";
import "../require/socket.io.jsx";

import "../models/User.jsx";
import "../data/CharacterDrawInfo.jsx";

// マイページ
class ChatPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, io : SocketManager) : void{
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
				x: 4 * 16 + 8,
				y : 4 * 16 + 8,
				r: Math.PI * 0.5
			};

			jdat["imgs"] = imgs;
			res.send(JSON.stringify(jdat));
		});

		// -------- socket.io接続 --------
		io.of("/chat").on("connection", function(client : Socket) : void{
			client.on("test", function() : void{
				client.emit("hoge");
			});
		});
	}
}

