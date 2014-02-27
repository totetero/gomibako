import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// クエストページ
class QuestPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/quest", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "クエスト"}));
		});
	}
}

