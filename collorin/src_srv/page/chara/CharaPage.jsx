import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// 一覧
		app.get("/chara/list", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター 一覧"}));
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

