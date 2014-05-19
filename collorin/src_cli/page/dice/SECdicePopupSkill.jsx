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

import "../core/popup/SECpopup.jsx";
import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";
import "SECdiceDice.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップイベントカートリッジ
class SECdicePopupSkill extends SECpopup{
	var _page : PageDice;
	var _player : Bb3dDiceCharacter;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _pw = 300;
	var _ph = 200;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, cartridge : SerialEventCartridge, player : Bb3dDiceCharacter){
		super(cartridge);
		this._page = page;
		this._player = player;

		// ラベル作成
		this._labList["name"] = new PartsLabel("スキル", 0, 0, this._pw, 40);

		// ボタン作成
		this._btnList["skill1"] = new PartsButtonBasic("ダブルさいころ", 10, 40, 240, 30);
		this._btnList["skill2"] = new PartsButtonBasic("6が出るさいころ", 30, 80, 240, 30);
		this._btnList["skill3"] = new PartsButtonBasic("レーザービーム", 50, 120, 240, 30);
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", (this._pw - 100) * 0.5, this._ph - 30 - 10, 100, 30);
		this._btnList["skill1"].zKey = true;
		this._btnList["skill2"].xKey = true;
		this._btnList["skill3"].cKey = true;
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テスト スキル1ボタン
		if(this._btnList["skill1"].trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceRoll(this._page, this.parentCartridge, "code", "ダブルさいころ", {
				"type": "dice",
				"num": 2,
				"fix": 0,
			}, null));
			return false;
		}

		// テスト スキル2ボタン
		if(this._btnList["skill2"].trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceRoll(this._page, this.parentCartridge, "code", "6が出るさいころ", {
				"type": "dice",
				"num": 1,
				"fix": 6,
			}, null));
			return false;
		}

		// テスト スキル3ボタン
		if(this._btnList["skill3"].trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceRoll(this._page, this.parentCartridge, "code", "レーザービーム", {
				"type": "beam",
				"num": 1,
				"fix": 0,
			}, this._player));
			return false;
		}

		// 閉じるボタン押下処理
		if(this._btnList["outer"].trigger || this._btnList["close"].trigger){
			Sound.playSE("ng");
			this._page.serialPush(this.parentCartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var px = (Ctrl.screen.w - this._pw) * 0.5;
		var py = (Ctrl.screen.h - this._ph) * 0.5;
		for(var name in this._labList){var lab = this._labList[name]; lab.x = lab.basex + px; lab.y = lab.basey + py;}
		for(var name in this._btnList){var btn = this._btnList[name]; btn.x = btn.basex + px; btn.y = btn.basey + py;}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, this._pw, this._ph);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

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

