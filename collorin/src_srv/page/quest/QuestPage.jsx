import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// クエストページ
class QuestPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// 進行可能
		app.get("/quest/curr", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "クエスト 進行可能"}));
		});

		// 完了クエスト
		app.get("/quest/fine", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "クエスト 完了クエスト"}));
		});
	}
}

