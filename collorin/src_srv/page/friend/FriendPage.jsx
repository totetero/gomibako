import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// 友達ページ
class FriendPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/friend", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "友達"}));
		});
	}
}

