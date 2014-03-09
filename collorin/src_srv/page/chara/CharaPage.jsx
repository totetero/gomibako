import "../../require/nodejs.jsx";
import "../../require/express.jsx";

import "../../util/ImageServer.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// 一覧
		app.get("/chara/list", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			jdat["test"] = "キャラクター 一覧";
			jdat["imgs"] = ImageServer.convertAddress({
				"b64_icon_player0": "img/character/player0/icon.png", "b64_bust_player0": "img/character/player0/bust.png",
				"b64_icon_player1": "img/character/player1/icon.png", "b64_bust_player1": "img/character/player1/bust.png",
				"b64_icon_player2": "img/character/player2/icon.png", "b64_bust_player2": "img/character/player2/bust.png",
				"b64_icon_player3": "img/character/player3/icon.png", "b64_bust_player3": "img/character/player3/bust.png",
				"b64_icon_enemy1": "img/character/enemy1/icon.png", "b64_bust_enemy1": "img/character/enemy1/bust.png",
				"b64_icon_enemy2": "img/character/enemy2/icon.png", "b64_bust_enemy2": "img/character/enemy2/bust.png",
				"b64_icon_enemy3": "img/character/enemy3/icon.png", "b64_bust_enemy3": "img/character/enemy3/bust.png",
			});
			res.contentType("application/json").send(JSON.stringify(jdat));
		});

		// 編成
		app.get("/chara/team", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター 編成"}));
		});

		// 休息
		app.get("/chara/rest", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター 休息"}));
		});

		// 強化
		app.get("/chara/pwup", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター 強化"}));
		});

		// 別れ
		app.get("/chara/sell", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター 別れ"}));
		});
	}
}

