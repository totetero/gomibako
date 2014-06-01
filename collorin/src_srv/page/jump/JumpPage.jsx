import "../../require/nodejs.jsx";
import "../../require/express.jsx";

import "../../util/ContentsServer.jsx";

// ジャンプページ
class JumpPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/jump", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var jdat = {} : Map.<variant>;
			var cont = {} : Map.<string>;

			cont["img_chara_dot_player1"] = "/img/character/player1/dot.png";

			// 背景画像
			jdat["background"] = "test";
			cont["img_background_test"] = "/img/background/test.png";

			jdat["contents"] = ContentsServer.convertAddress(cont);
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify(jdat));
		});
	}
}

