import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// ワールドページ
class WorldPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/world", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "ワールド"}));
		});
	}
}

