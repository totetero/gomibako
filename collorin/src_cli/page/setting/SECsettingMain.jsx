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

import "../core/popup/SECpopupMenu.jsx";
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

// 設定カートリッジ
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
		this._scroller = new PartsScroll(0, 50, 0, 0, 320, 10 + (38 + 10) * 6);

		this._scroller.btnList["nickname"] = this._nicknameTextarea.createButton(0, 0, 160, 38);
		this._scroller.labList["nickname"] = new PartsLabel("ニックネーム", 0, 0, 130, 38);
		this._scroller.labList["nickname"].setAlign("right");

		this._scroller.btnList["comment"] = this._commentTextarea.createButton(0, 0, 160, 38);
		this._scroller.labList["comment"] = new PartsLabel("コメント", 0, 0, 130, 38);
		this._scroller.labList["comment"].setAlign("right");

		this._scroller.btnList["quality"] = this._qualityPicker.createButton(0, 0, 120);
		this._scroller.labList["quality"] = new PartsLabel("ゲーム画質", 0, 0, 130, 38);
		this._scroller.labList["quality"].setAlign("right");

		this._scroller.btnList["transition"] = this._transitionPicker.createButton(0, 0, 120);
		this._scroller.labList["transition"] = new PartsLabel("ページ遷移演出", 0, 0, 130, 38);
		this._scroller.labList["transition"].setAlign("right");

		this._scroller.btnList["bgm"] = this._bgmPicker.createButton(0, 0, 120);
		this._scroller.labList["bgm"] = new PartsLabel("BGM", 0, 0, 130, 38);
		this._scroller.labList["bgm"].setAlign("right");

		this._scroller.btnList["sef"] = this._sefPicker.createButton(0, 0, 120);
		this._scroller.labList["sef"] = new PartsLabel("効果音", 0, 0, 130, 38);
		this._scroller.labList["sef"].setAlign("right");
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		this._page.header.setActive(true);
		// トリガーリセット
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}
		this._page.header.lbtn.trigger = false;
		this._page.header.rbtn.trigger = false;
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
			if(this._scroller.btnList[name].trigger){
				Sound.playSE("ok");
				this._page.serialPush(list[name]);
				return false;
			}
		}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this._page.header.rbtn.trigger){
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
		this._scroller.cw = Ctrl.screen.w;
		this._scroller.ch = Ctrl.screen.h - 50;
		var x = Math.max(0, (this._scroller.cw - this._scroller.sw) * 0.5);
		var y = Math.max(0, (this._scroller.ch - this._scroller.sh) * 0.25);
		var nameList = ["nickname", "comment", "quality", "transition", "bgm", "sef"];
		for(var i = 0; i < nameList.length; i++){
			this._scroller.labList[nameList[i]].basex = 10 + x;
			this._scroller.btnList[nameList[i]].basex = 150 + x;
			this._scroller.labList[nameList[i]].basey = 10 + (38 + 10) * i + y;
			this._scroller.btnList[nameList[i]].basey = 10 + (38 + 10) * i + y;
		}

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.screen.w, Ctrl.screen.h);

		// スクローラー描画
		this._scroller.draw(function() : void{}, 0, 0, Ctrl.screen.w, Ctrl.screen.h);

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

