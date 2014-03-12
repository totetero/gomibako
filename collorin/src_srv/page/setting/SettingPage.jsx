import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// 設定ページ
class SettingPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/setting", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			var nickname = req.query["nickname"];
			var comment = req.query["comment"];

			if(nickname == null){nickname = req.user.nickname;}
			if(comment == null){comment = "こんにちわん";}

			res.contentType("application/json").send(JSON.stringify({
				"nickname": nickname,
				"comment":  comment,
			}));
		});
	}
}

