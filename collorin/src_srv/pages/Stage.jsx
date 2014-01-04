import "../require/nodejs.jsx";
import "../require/express.jsx";

// ステージ選択ページ
class StagePage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/stage/:info", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.render("stage.ejs", {area: req.params["info"]});
		});
	}
}

