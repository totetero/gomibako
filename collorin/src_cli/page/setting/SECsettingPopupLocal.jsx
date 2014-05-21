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
import "SECsettingPopupPickerQuality.jsx";
import "SECsettingPopupPickerTransition.jsx";
import "SECsettingPopupPickerBgm.jsx";
import "SECsettingPopupPickerSef.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ローカルで完結する設定ポップアップ
class SECsettingPopupLocal extends SECpopup{
	var _page : Page;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _qualityPicker : SECsettingPopupPickerQuality;
	var _transitionPicker : SECsettingPopupPickerTransition;
	var _bgmPicker : SECsettingPopupPickerBgm;
	var _sefPicker : SECsettingPopupPickerSef;
	var _pw = 240;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;
		this._qualityPicker = new SECsettingPopupPickerQuality(this._page, this);
		this._transitionPicker = new SECsettingPopupPickerTransition(this._page, this);
		this._bgmPicker = new SECsettingPopupPickerBgm(this._page, this);
		this._sefPicker = new SECsettingPopupPickerSef(this._page, this);

		// ラベル作成
		this._labList["title"] = new PartsLabel("メニュー 設定", 0, 0, this._pw, 30);

		// スクローラ作成
		this._scroller = new PartsScroll(0, 0, this._pw - 6, 0, 0, 10 + (38 + 10) * 4);
		var y1 = 10 + (38 + 10) * 0;
		var y2 = 10 + (38 + 10) * 1;
		var y3 = 10 + (38 + 10) * 2;
		var y4 = 10 + (38 + 10) * 3;

		this._scroller.btnList["quality"] = this._qualityPicker.createButton(110, y1, 120);
		this._scroller.labList["quality"] = new PartsLabel("ゲーム画質", 0, y1, 100, 38);
		this._scroller.labList["quality"].setAlign("right");

		this._scroller.btnList["transition"] = this._transitionPicker.createButton(110, y2, 120);
		this._scroller.labList["transition"] = new PartsLabel("遷移演出", 0, y2, 100, 38);
		this._scroller.labList["transition"].setAlign("right");

		this._scroller.btnList["bgm"] = this._bgmPicker.createButton(110, y3, 120);
		this._scroller.labList["bgm"] = new PartsLabel("BGM", 0, y3, 100, 38);
		this._scroller.labList["bgm"].setAlign("right");

		this._scroller.btnList["sef"] = this._sefPicker.createButton(110, y4, 120);
		this._scroller.labList["sef"] = new PartsLabel("効果音", 0, y4, 100, 38);
		this._scroller.labList["sef"].setAlign("right");

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, 0, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._pw - 80 - 10, 0, 80, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		this._page.header.setActive(false);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 設定ボタン押下処理
		var list = {
			"quality": this._qualityPicker,
			"transition": this._transitionPicker,
			"bgm": this._bgmPicker,
			"sef": this._sefPicker,
		};
		for(var name in list){
			if(this._scroller.btnList[name].trigger){
				Sound.playSE("ok");
				this._page.serialPush(list[name]);
				this.close = false;
				return false;
			}
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
		var tLab = this._labList["title"];
		var oBtn = this._btnList["outer"];
		var cBtn = this._btnList["close"];
		var cArea = 42;
		var ph = oBtn.h = Math.min(Ctrl.screen.h - 20, this._scroller.sh + (3 + tLab.h + 2) + (3 + cArea + 2));
		var px = oBtn.x = (Ctrl.screen.w - this._pw) * 0.5;
		var py = oBtn.y = (Ctrl.screen.h - ph) * 0.5;
		tLab.x = px;
		tLab.y = py + 3;
		cBtn.x = px + (this._pw - cBtn.w) * 0.5;
		cBtn.y = py + ph - 3 - (cArea + cBtn.h) * 0.5;
		this._scroller.x = px + 3;
		this._scroller.y = py + (3 + tLab.h + 2);
		this._scroller.ch = ph - (3 + tLab.h + 2) - (3 + cArea + 2);

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, this._pw, ph);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h), this._pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + ph - (3 + cArea) - 2, this._pw - 6, 2);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{});
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

