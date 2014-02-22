import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// マイページ
class MyPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/mypage", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.send(JSON.stringify({"test": "マイページ"}));
		});
	}
}

