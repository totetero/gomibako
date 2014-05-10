import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/PartsLabel.jsx";
import "../core/PartsScroll.jsx";
import "../core/SECpopupMenu.jsx";

import "PageSetting.jsx";
import "SECsettingPopupTextareaNickname.jsx";
import "SECsettingPopupTextareaComment.jsx";
import "SECsettingPopupPickerQuality.jsx";
import "SECsettingPopupPickerTransition.jsx";
import "SECsettingPopupPickerBgm.jsx";
import "SECsettingPopupPickerSef.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 設定イベントカートリッジ
class SECsettingMain implements SerialEventCartridge{
	var _page : PageSetting;
	var _scroller : PartsScroll;
	var _nicknameTextarea : SECsettingPopupTextareaNickname;
	var _commentTextarea : SECsettingPopupTextareaComment;
	var _qualityPicker : SECsettingPopupPickerQuality;
	var _transitionPicker : SECsettingPopupPickerTransition;
	var _bgmPicker : SECsettingPopupPickerBgm;
	var _sefPicker : SECsettingPopupPickerSef;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageSetting, response : variant){
		this._page = page;
		this._nicknameTextarea = new SECsettingPopupTextareaNickname(this._page, this, response);
		this._commentTextarea = new SECsettingPopupTextareaComment(this._page, this, response);
		this._qualityPicker = new SECsettingPopupPickerQuality(this._page, this);
		this._transitionPicker = new SECsettingPopupPickerTransition(this._page, this);
		this._bgmPicker = new SECsettingPopupPickerBgm(this._page, this);
		this._sefPicker = new SECsettingPopupPickerSef(this._page, this);

		// スクローラ作成
		this._scroller = new PartsScroll(0, 50, 320, 0, 320, 10 + (38 + 10) * 6);

		var y = 10 + (38 + 10) * 0;
		this._scroller.btnList["nickname"] = this._nicknameTextarea.createButton(150, y, 160, 38);
		this._scroller.labList["nickname"] = new PartsLabel("ニックネーム", 10, y, 130, 38);
		this._scroller.labList["nickname"].setAlign("right");

		var y = 10 + (38 + 10) * 1;
		this._scroller.btnList["comment"] = this._commentTextarea.createButton(150, y, 160, 38);
		this._scroller.labList["comment"] = new PartsLabel("コメント", 10, y, 130, 38);
		this._scroller.labList["comment"].setAlign("right");

		var y = 10 + (38 + 10) * 2;
		this._scroller.btnList["quality"] = this._qualityPicker.createButton(150, y, 120);
		this._scroller.labList["quality"] = new PartsLabel("ゲーム画質", 10, y, 130, 38);
		this._scroller.labList["quality"].setAlign("right");

		var y = 10 + (38 + 10) * 3;
		this._scroller.btnList["transition"] = this._transitionPicker.createButton(150, y, 120);
		this._scroller.labList["transition"] = new PartsLabel("ページ遷移演出", 10, y, 130, 38);
		this._scroller.labList["transition"].setAlign("right");

		var y = 10 + (38 + 10) * 4;
		this._scroller.btnList["bgm"] = this._bgmPicker.createButton(150, y, 120);
		this._scroller.labList["bgm"] = new PartsLabel("BGM", 10, y, 130, 38);
		this._scroller.labList["bgm"].setAlign("right");

		var y = 10 + (38 + 10) * 5;
		this._scroller.btnList["sef"] = this._sefPicker.createButton(150, y, 120);
		this._scroller.labList["sef"] = new PartsLabel("効果音", 10, y, 130, 38);
		this._scroller.labList["sef"].setAlign("right");
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラとじてる
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// ヘッダ有効化
		this._page.header.setActive(true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);

		// 設定ボタン押下処理
		var list = {
			"nickname": this._nicknameTextarea,
			"comment": this._commentTextarea,
			"quality": this._qualityPicker,
			"transition": this._transitionPicker,
			"bgm": this._bgmPicker,
			"sef": this._sefPicker,
		};
		for(var name in list){
			var btn = this._scroller.btnList[name];
			if(btn.trigger){
				btn.trigger = false;
				Sound.playSE("ok");
				this._page.serialPush(list[name]);
				return false;
			}
		}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			this._page.header.lbtn.trigger = false;
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this._page.header.rbtn.trigger){
			this._page.header.rbtn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		this._scroller.ch = Ctrl.sh - 50;

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);

		// スクローラー描画
		this._scroller.draw(function() : void{}, 0, 0, Ctrl.sw, Ctrl.sh);

		// ヘッダ描画
		this._page.header.draw();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

