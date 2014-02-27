import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// キャラクターページ
class CharaPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/chara", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "キャラクター"}));
		});
	}
}

