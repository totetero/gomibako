import "../../require/nodejs.jsx";
import "../../require/express.jsx";

// アイテムページ
class ItemPage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		// 一覧
		app.get("/item/list", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "アイテム 一覧"}));
		});

		// 作成
		app.get("/item/make", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "アイテム 作成"}));
		});

		// 購入
		app.get("/item/shop", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			res.contentType("application/json").send(JSON.stringify({"test": "アイテム 購入"}));
		});
	}
}

