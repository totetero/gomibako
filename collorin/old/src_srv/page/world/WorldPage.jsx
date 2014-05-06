import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// ワールドページ
class WorldPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/world", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "ワールド"}));
		});
	}
}

