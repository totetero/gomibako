import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// 図鑑ページ
class PageRefbook{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/refbook", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.setHeader("Content-Type", "application/json");
			res.setHeader("cache-control", "no-cache");
			res.send(JSON.stringify({"test": "図鑑"}));
		});
	}
}

