import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// トップページ
class TopPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/", function(req : ExRequest, res : ExResponse, next : function():void) : void{res.redirect("/top");});
		app.get("/top", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.render("top.ejs");
		});
	}
}

