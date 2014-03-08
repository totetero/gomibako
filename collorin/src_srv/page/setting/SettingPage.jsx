import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// 設定ページ
class SettingPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/setting", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "設定"}));
		});
	}
}

