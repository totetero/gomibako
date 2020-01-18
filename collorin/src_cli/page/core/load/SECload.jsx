import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ローディングカートリッジ
class SECload implements SerialEventCartridge{
	var _prevCartridge : SerialEventCartridge;
	var _loading = true;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(prevCartridge : SerialEventCartridge, url : string, request : variant, callback : function(response:variant):void){
		this._prevCartridge = prevCartridge;

		// ロード開始
		Loading.show();
		Loader.loadxhr(url, request, function(response : variant) : void{
			Loader.loadContents(response["contents"] as Map.<string>, function() : void{
				this._loading = false;
				callback(response);
				Loading.hide();
			});
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return this._loading;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._prevCartridge.draw();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

