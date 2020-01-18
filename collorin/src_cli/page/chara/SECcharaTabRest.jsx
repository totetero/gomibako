import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター休息タブカートリッジ
class SECcharaTabRest extends SECcharaTab{
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, response : variant){
		super(page, "rest");

		this._btnList["test"] = new PartsButtonBasic("てす", 60, 60, 250, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		super.init();
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function tabCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function tabDraw() : void{
		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
