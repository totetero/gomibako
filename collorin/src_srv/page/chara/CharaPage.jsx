import "../../require/express.jsx";

import "CharaPageTeam.jsx";
import "CharaPageSupp.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		CharaPageTeam.setPage(app);
		CharaPageSupp.setPage(app);

		// -------- 休息 --------
		app.get("/chara/rest", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 休息"}));
		});

		// -------- 強化 --------
		app.get("/chara/pwup", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 強化"}));
		});

		// -------- 別れ --------
		app.get("/chara/sell", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "キャラクター 別れ"}));
		});
	}
}

