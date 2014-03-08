import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// 図鑑ページ
class RefbookPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/refbook", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "図鑑"}));
		});
	}
}

