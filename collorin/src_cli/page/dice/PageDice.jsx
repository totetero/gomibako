import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/SECtransition.jsx";

import "Bb3dDiceCanvas.jsx";
import "SECdiceMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストページ
class PageDice extends Page{
	var bcvs : Bb3dDiceCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "dice";
		this.depth = 21;
		this.bgm = "test02";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECtransition(this, "/dice", {"type": "entry"}, function(response : variant) : SerialEventCartridge{
			// クロス要素の展開処理
			this.ctrler.setLctrl(false);
			this.ctrler.setRctrl("", "", "", "");
			this.header.setType("", "");
			// キャンバス作成
			this.bcvs = new Bb3dDiceCanvas(0, 0, 1);
			// 応答処理
			log response;
			return new SECdiceMain(this);
		}));
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this.bcvs != null){this.bcvs.calc();}
		return super.calc();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

