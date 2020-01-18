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

import "../core/data/chara/DataChara.jsx";
import "../core/data/chara/SECpopupDataChara.jsx";
import "PageDice.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくマップ表示カートリッジ
class SECdiceMap implements SerialEventCartridge{
	var _page : PageDice;
	var _cartridge : SerialEventCartridge;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, cartridge : SerialEventCartridge){
		this._page = page;
		this._cartridge = cartridge;

		// ボタン作成
		this._btnList["lchara"] = new PartsButton(0, 0, 50, 50, true);
		this._btnList["rchara"] = new PartsButton(0, 0, 50, 50, true);
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
		// クロス設定
		this._page.bust.set(null);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "もどる");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
		Ctrl.trigger_s = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._btnList["rchara"].x = Ctrl.screen.w - 50;
		this._page.bcvs.calcButton(this._btnList);
		this._page.gauge.lActive = this._btnList["lchara"].active;
		this._page.gauge.rActive = this._btnList["rchara"].active;

		// 左ゲージアイコンタップ
		if(this._page.gauge.lChara != null && this._btnList["lchara"].trigger){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.lChara));
			return false;
		}

		// 右ゲージアイコンタップ
		if(this._page.gauge.rChara != null && this._btnList["rchara"].trigger){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.rChara));
			return false;
		}

		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// 戻るボタン
		if(Ctrl.trigger_s){
			Sound.playSE("ng");
			this._page.serialPush(this._cartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// キャンバス描画
		this._page.bcvs.draw();
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
