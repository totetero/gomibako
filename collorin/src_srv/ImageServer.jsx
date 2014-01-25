import "require/nodejs.jsx";
import "require/express.jsx";

// 画像配信クラス
class ImageServer{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(url : string, path : string, app : ExApplication) : void{
		app.post(url, function(req : ExRequest, res : ExResponse, next : function():void) : void{
			log req.body;
		});
	}
}

