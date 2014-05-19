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

import "../core/data/SECpopupDataChara.jsx";
import "PageChat.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットカートリッジ
class SECchatMain implements SerialEventCartridge{
	var _page : PageChat;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChat, response : variant){
		this._page = page;

		// ボタン作成
		this._btnList["test"] = new PartsButtonBasic("テスト",  -110, 10, 100, 30);
		this._btnList["back"] = new PartsButtonBasic("退出",  -110, -40, 100, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapGrid = false;
		// クロス設定
		this._page.ctrler.setLctrl(true);
		this._page.ctrler.setRctrl("", "", "", "");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._page.bcvs.calcButton(this._btnList);

		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// 中断ボタン
		if(this._btnList["back"].trigger){
			Sound.playSE("ng");
			Page.transitionsPage("world");
			return true;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		for(var name in this._btnList){
			var btn = this._btnList[name];
			if(btn.basex < 0){btn.x = Ctrl.screen.w + btn.basex;}
			if(btn.basey < 0){btn.y = Ctrl.screen.h + btn.basey;}
		}

		this._page.drawBeforeCross();

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		this._page.drawAfterCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

