import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// ヘルプページ
class HelpPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/help", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "ヘルプ"}));
		});
	}
}

