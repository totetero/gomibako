import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

//class MockServer{static function loadxhr(url : string, request : variant) : variant{return null;}}
//*// モッククラス
class MockServer{
	// ----------------------------------------------------------------
	// XMLhttpリクエストエミュレート
	static function loadxhr(url : string, request : variant) : variant{
		if(url.indexOf("/mypage") == 0){
			return {"test": "モックマイページ"};
		}else if(url.indexOf("/world") == 0){
			return {"test": "モックワールド"};
		}else if(url.indexOf("/quest/curr") == 0){
			return {"test": "モッククエスト 進行可能"};
		}else if(url.indexOf("/quest/fine") == 0){
			return {"test": "モッククエスト 完了クエスト"};
		}else if(url.indexOf("/chara/team") == 0){
			return {"test": "モックキャラクタ 編成"};
		}else if(url.indexOf("/chara/supp") == 0){
			//return {"test": "モックキャラクタ 補給"};
		}else if(url.indexOf("/chara/rest") == 0){
			return {"test": "モックキャラクタ 休息"};
		}else if(url.indexOf("/chara/pwup") == 0){
			return {"test": "モックキャラクタ 強化"};
		}else if(url.indexOf("/chara/sell") == 0){
			return {"test": "モックキャラクタ 別れ"};
		}else if(url.indexOf("/item/list") == 0){
			return {"test": "モックアイテム 一覧"};
		}else if(url.indexOf("/item/make") == 0){
			return {"test": "モックアイテム 作成"};
		}else if(url.indexOf("/item/shop") == 0){
			return {"test": "モックアイテム 購入"};
		}else if(url.indexOf("/friend") == 0){
			return {"test": "モック友達"};
		}else if(url.indexOf("/refbook") == 0){
			return {"test": "モック図鑑"};
		}else if(url.indexOf("/setting") == 0){
			return {"test": "モック設定"};
		}else if(url.indexOf("/help") == 0){
			return {"test": "モックヘルプ"};
		}else if(url.indexOf("/dice") == 0){
			//return {"test": "モックすごろく"};
		}else if(url.indexOf("/chat") == 0){
			//return {"test": "モックチャット"};
		}
		return null;
	}
}//*/

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

