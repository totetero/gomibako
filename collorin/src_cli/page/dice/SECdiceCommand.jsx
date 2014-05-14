import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/parts/PartsButton.jsx";
import "../core/data/DataChara.jsx";

import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";
import "SECdiceDice.jsx";
import "SECdiceMap.jsx";
import "SECdicePopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくコマンド入力待ちカートリッジ
class SECdiceCommand implements SerialEventCartridge{
	var _page : PageDice;
	var _player : Bb3dDiceCharacter;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		this._player = this._page.bcvs.member[response["id"] as string];

		// ボタン作成
		this._btnList["lchara"] = new PartsButton(0, 0, 50, 50, true);
		this._btnList["rchara"] = new PartsButton(Ctrl.sw - 50, 0, 50, 50, true);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 2.5;
		this._page.bcvs.cameraCenter = [this._player];
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(this._player);
		this._page.gauge.setLeft(this._player, -1);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("さいころ", "スキル", "マップ", "メニュー");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
		this._page.ctrler.z_Trigger = false;
		this._page.ctrler.x_Trigger = false;
		this._page.ctrler.c_Trigger = false;
		this._page.ctrler.s_Trigger = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._page.bcvs.calcButton(this._btnList);
		this._page.gauge.lActive = this._btnList["lchara"].active;
		this._page.gauge.rActive = this._btnList["rchara"].active;

		// 左ゲージアイコンタップ
		if(this._page.gauge.lChara != null && this._btnList["lchara"].trigger){
			Sound.playSE("ok");
			this._page.bust.set(null);
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.lChara));
			return false;
		}

		// 右ゲージアイコンタップ
		if(this._page.gauge.rChara != null && this._btnList["rchara"].trigger){
			Sound.playSE("ok");
			this._page.bust.set(null);
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.rChara));
			return false;
		}

		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.bust.set(null);
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// さいころボタン
		if(this._page.ctrler.z_Trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceRoll(this._page, this, "code", "message", {
				"type": "dice",
				"num": 1,
				"fix": 0,
			}, this._player));
			return false;
		}

		// マップボタン
		if(this._page.ctrler.c_Trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceMap(this._page, this));
			return false;
		}

		// メニューボタン
		if(this._page.ctrler.s_Trigger){
			Sound.playSE("ok");
			this._page.bust.set(null);
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECdicePopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
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

