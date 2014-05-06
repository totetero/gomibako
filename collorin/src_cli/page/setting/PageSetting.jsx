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
import "../core/SECpopupPicker.jsx";
import "../core/SECpopupTextarea.jsx";
import "../core/SECtransition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 設定ページ
class PageSetting extends Page{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "setting";
		this.depth = 11;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECtransition(this, "/setting", null, function(response : variant) : SerialEventCartridge{
			// クロス要素の展開処理
			this.ctrler.setLctrl(false);
			this.ctrler.setRctrl("", "", "", "");
			this.header.setType("設定", "mypage");
			// 応答処理
			log response;
			return new SECsettingMain(this);
		}));
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
	function constructor(page : PageSetting){
		this._page = page;
		this._nicknameTextarea = new SECsettingPopupTextareaNickname(this._page, this);
		this._commentTextarea = new SECsettingPopupTextareaComment(this._page, this);
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
		// ヘッダ有効化
		this._page.header.setActive(true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);

		// 画質ピッカーボタン押下処理
		var btn = this._scroller.btnList["nickname"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._nicknameTextarea);
			return false;
		}

		// 画質ピッカーボタン押下処理
		var btn = this._scroller.btnList["comment"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._commentTextarea);
			return false;
		}

		// 画質ピッカーボタン押下処理
		var btn = this._scroller.btnList["quality"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._qualityPicker);
			return false;
		}

		// ページ遷移ピッカーボタン押下処理
		var btn = this._scroller.btnList["transition"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._transitionPicker);
			return false;
		}

		// BGMピッカーボタン押下処理
		var btn = this._scroller.btnList["bgm"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._bgmPicker);
			return false;
		}

		// 効果音ピッカーボタン押下処理
		var btn = this._scroller.btnList["sef"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._sefPicker);
			return false;
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

// ニックネームのテキストエリア
class SECsettingPopupTextareaNickname extends SECpopupTextarea{
	var _sPage : PageSetting;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageSetting, cartridge : SerialEventCartridge){
		super(page, cartridge, "ニックネーム設定", 8);
		this.setValue("にゃんにゃん"); // TODO
		this._sPage = page;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		//if(value != this._sPage.nickname){
		//	this._sPage.serialPush(new SECload("/setting?nickname=" + value, null, function(response : variant) : void{this._sPage.parse(response);}));
		//}
	}
}

// コメントのテキストエリア
class SECsettingPopupTextareaComment extends SECpopupTextarea{
	var _sPage : PageSetting;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageSetting, cartridge : SerialEventCartridge){
		super(page, cartridge, "コメント設定", 16);
		this.setValue("げんきかえ？"); // TODO
		this._sPage = page;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		//if(value != this._sPage.comment){
		//	this._sPage.serialPush(new SECload("/setting?comment=" + value, null, function(response : variant) : void{this._sPage.parse(response);}));
		//}
	}
}

// 画質のピッカー
class SECsettingPopupPickerQuality extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "ゲーム画質", [
			new SECpopupPickerItem("high", "高画質"),
			new SECpopupPickerItem("middle", "普通画質"),
			new SECpopupPickerItem("low", "低画質")
		]);

		if(dom.window.devicePixelRatio <= 1){this.getItem("high").inactive = true;}

		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality != "high" && quality != "low"){quality = "middle";}
		this.setSelectedItem(quality);
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		dom.window.localStorage.setItem("setting_quality", tag);
		Ctrl.setCanvas();
	}
}

// ページ遷移演出のピッカー
class SECsettingPopupPickerTransition extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "ページ遷移演出", [
			new SECpopupPickerItem("on", "ON"),
			new SECpopupPickerItem("off", "OFF")
		]);

		var transition = dom.window.localStorage.getItem("setting_transition");
		if(transition != "off"){transition = "on";}
		this.setSelectedItem(transition);
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		dom.window.localStorage.setItem("setting_transition", tag);
	}
}

// BGMのピッカー
class SECsettingPopupPickerBgm extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "BGM", [
			new SECpopupPickerItem("high", "音量大"),
			new SECpopupPickerItem("middle", "音量中"),
			new SECpopupPickerItem("low", "音量小"),
			new SECpopupPickerItem("off", "OFF")
		]);

		if(Sound.isSupported){
			var volume = dom.window.localStorage.getItem("setting_bgmVolume");
			this.setSelectedItem(volume);
		}else{
			this.getItem("high").inactive = true;
			this.getItem("middle").inactive = true;
			this.getItem("low").inactive = true;
			this.setSelectedItem("off");
		}
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		Sound.setBgmVolume(tag);
	}
}

// 効果音のピッカー
class SECsettingPopupPickerSef extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "効果音", [
			new SECpopupPickerItem("high", "音量大"),
			new SECpopupPickerItem("middle", "音量中"),
			new SECpopupPickerItem("low", "音量小"),
			new SECpopupPickerItem("off", "OFF")
		]);

		if(Sound.isSupported){
			var volume = dom.window.localStorage.getItem("setting_sefVolume");
			this.setSelectedItem(volume);
		}else{
			this.getItem("high").inactive = true;
			this.getItem("middle").inactive = true;
			this.getItem("low").inactive = true;
			this.setSelectedItem("off");
		}
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		Sound.setSefVolume(tag);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

