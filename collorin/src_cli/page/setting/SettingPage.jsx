import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/PartsScroll.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";
import "../page/SECpopupPicker.jsx";
import "../page/SECpopupTextarea.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SettingPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div class="scrollContainerContainer">
			<div class="scrollContainer">
				<div class="scroll">
					<div class="nickname"><div class="label">ニックネーム</div><div class="field"></div></div>
					<div class="comment"><div class="label">コメント</div><div class="field"></div></div>
					<div class="quality"><div class="label">ゲーム画質</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
					<div class="bgm"><div class="label">BGM</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
					<div class="se"><div class="label">効果音</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
				</div>
				<div class="core-ybar"></div>
			</div>
		</div>
	""";

	// サーバから受け取った設定情報
	var nickname : string;
	var comment : string;

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
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page setting";
		this.div.innerHTML = SettingPage._htmlTag;

		// イベント設定
		this.serialPush(new SECload("/setting", null, function(response : variant) : void{this.parse(response);}));
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("設定", 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECsettingPageMain(this));
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		this.nickname = response["nickname"] as string;
		this.comment = response["comment"] as string;
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

class SECsettingPageMain extends EventCartridge{
	var _page : SettingPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _qualityPicker : SECsettingPopupPickerQuality;
	var _bgmPicker : SECsettingPopupPickerBgm;
	var _sePicker : SECsettingPopupPickerSe;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : SettingPage){
		this._page = page;

		this._qualityPicker = new SECsettingPopupPickerQuality();
		this._bgmPicker = new SECsettingPopupPickerBgm();
		this._sePicker = new SECsettingPopupPickerSe();
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		var nicknameDiv = this._page.div.getElementsByClassName("nickname").item(0).getElementsByClassName("field").item(0) as HTMLDivElement;
		var commentDiv = this._page.div.getElementsByClassName("comment").item(0).getElementsByClassName("field").item(0) as HTMLDivElement;
		var qualityDiv = this._page.div.getElementsByClassName("quality").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var bgmDiv = this._page.div.getElementsByClassName("bgm").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var seDiv = this._page.div.getElementsByClassName("se").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;

		// テキストエリア設定
		nicknameDiv.innerHTML = this._page.nickname;
		commentDiv.innerHTML = this._page.comment;

		// ピッカー設定
		this._qualityPicker.setLabel(qualityDiv);
		this._bgmPicker.setLabel(bgmDiv);
		this._sePicker.setLabel(seDiv);

		// スクロール作成
		if(this._scroller == null){
			this._scroller = new PartsScroll(
				this._page.div.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
				this._page.div.getElementsByClassName("scroll").item(0) as HTMLDivElement,
				null,
				this._page.div.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		this._scroller.btnList["nickname"] = new PartsButton(nicknameDiv, true);
		this._scroller.btnList["comment"] = new PartsButton(commentDiv, true);
		this._scroller.btnList["quality"] = new PartsButton(qualityDiv, true);
		this._scroller.btnList["bgm"] = new PartsButton(bgmDiv, true);
		this._scroller.btnList["se"] = new PartsButton(seDiv, true);

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// テキストエリアボタン
		if(this._scroller.btnList["nickname"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECsettingPopupTextareaNickname(this._page, this)); return false;}
		if(this._scroller.btnList["comment"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECsettingPopupTextareaComment(this._page, this)); return false;}

		// ピッカーボタン
		if(this._scroller.btnList["quality"].trigger){Sound.playSE("ok"); this._page.serialPush(this._qualityPicker.beforeOpen(this._page, this)); return false;}
		if(this._scroller.btnList["bgm"].trigger){Sound.playSE("ok"); this._page.serialPush(this._bgmPicker.beforeOpen(this._page, this)); return false;}
		if(this._scroller.btnList["se"].trigger){Sound.playSE("ok"); this._page.serialPush(this._sePicker.beforeOpen(this._page, this)); return false;}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Sound.playSE("ng"); Page.transitionsPage("mypage");}

		return true;
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
	var _sPage : SettingPage;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : SettingPage, cartridge : EventCartridge){
		super(page, cartridge, page.nickname, 8);
		this._sPage = page;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function enter(value : string) : void{
		if(value != this._sPage.nickname){
			this._sPage.serialPush(new SECload("/setting?nickname=" + value, null, function(response : variant) : void{this._sPage.parse(response);}));
		}
	}
}

// コメントのテキストエリア
class SECsettingPopupTextareaComment extends SECpopupTextarea{
	var _sPage : SettingPage;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : SettingPage, cartridge : EventCartridge){
		super(page, cartridge, page.comment, 8);
		this._sPage = page;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function enter(value : string) : void{
		if(value != this._sPage.comment){
			this._sPage.serialPush(new SECload("/setting?comment=" + value, null, function(response : variant) : void{this._sPage.parse(response);}));
		}
	}
}

// 画質のピッカー
class SECsettingPopupPickerQuality extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		super("ゲーム画質", [
			new SECpopupPickerItem("high", "高画質"),
			new SECpopupPickerItem("middle", "普通画質"),
			new SECpopupPickerItem("low", "低画質")
		]);

		if(dom.window.devicePixelRatio <= 1){this.getItem("high").inactive = true;}

		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality != "high" && quality != "low"){quality = "middle";}
		this.getItem(quality).selected = true;
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function select(tag : string) : void{
		dom.window.localStorage.setItem("setting_quality", tag);
	}
}

// BGMのピッカー
class SECsettingPopupPickerBgm extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		super("BGM", [
			new SECpopupPickerItem("off", "OFF")
		]);
		this.getItem("off").selected = true;
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function select(tag : string) : void{
	}
}

// 効果音のピッカー
class SECsettingPopupPickerSe extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		super("効果音", [
			new SECpopupPickerItem("off", "OFF")
		]);
		this.getItem("off").selected = true;
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function select(tag : string) : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

