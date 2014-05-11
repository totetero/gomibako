import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/PartsButton.jsx";

import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター編成タブカートリッジ
class SECcharaTabTeam extends SECcharaTab{
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara){
		super(page, "team");

		this._btnList["test"] = new PartsButtonBasic("てす", 60, 60, 250, 30);
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

