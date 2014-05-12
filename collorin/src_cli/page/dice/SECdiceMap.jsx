import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/parts/PartsButton.jsx";
import "../core/data/DataChara.jsx";
import "../core/sec/SECpopupMenu.jsx";

import "PageDice.jsx";
import "Bb3dDiceCanvas.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくマップ表示カートリッジ
class SECdiceMap implements SerialEventCartridge{
	var _page : PageDice;
	var _cartridge : SerialEventCartridge;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, cartridge : SerialEventCartridge){
		this._page = page;
		this._cartridge = cartridge;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = true;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 1;
		this._page.bcvs.cameraCenter = null;
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapHex = false;
		// トリガーリセット
		this._page.bcvs.charaTrigger = null;
		this._page.ctrler.s_Trigger = false;
		// コントローラ表示
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "戻る");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// 戻るボタン
		if(this._page.ctrler.s_Trigger){
			Sound.playSE("ng");
			this._page.serialPush(this._cartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 画面クリア
		Ctrl.sctx.clearRect(0, 0, Ctrl.sw, Ctrl.sh);

		// クロス要素の描画
		this._page.drawCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

