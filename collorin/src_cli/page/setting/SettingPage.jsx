import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/PartsScroll.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";
import "../page/SECpopupPicker.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SettingPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div class="scrollContainerContainer">
			<div class="scrollContainer">
				<div class="scroll">
					<div class="nickname"><div class="label">ニックネーム</div><div class="field">あああ</div></div>
					<div class="comment"><div class="label">コメント</div><div class="field">いいい</div></div>
					<div class="quality"><div class="label">ゲーム画質</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
					<div class="bgm"><div class="label">BGM</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
					<div class="se"><div class="label">効果音</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div></div>
				</div>
				<div class="core-ybar"></div>
			</div>
		</div>
	""";

	//var qualityPicker : SECsettingPopupPickerQuality;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "setting";
		this.depth = 11;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page setting";
		this.div.innerHTML = SettingPage._htmlTag;

		// イベント設定
		this.serialPush(new SECload("/setting", null, function(response : variant) : void{
			// ロード完了 データの形成
			log response;
		}));
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

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : SettingPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		var nicknameDiv = this._page.div.getElementsByClassName("nickname").item(0).getElementsByClassName("field").item(0) as HTMLDivElement;
		var commentDiv = this._page.div.getElementsByClassName("comment").item(0).getElementsByClassName("field").item(0) as HTMLDivElement;
		var qualityDiv = this._page.div.getElementsByClassName("quality").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var bgmDiv = this._page.div.getElementsByClassName("bgm").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var seDiv = this._page.div.getElementsByClassName("se").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;

		// スクロール作成
		this._scroller = new PartsScroll(
			this._page.div.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
			this._page.div.getElementsByClassName("scroll").item(0) as HTMLDivElement,
			null,
			this._page.div.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
		);
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

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Page.transitionsPage("mypage");}

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

/*
class SECsettingPopupPicker extends SECpopupPicker{
	var settingItemList : SECpopupPickerItem[];
}

class SECsettingPopupPickerQuality extends SECsettingPopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.settingItemList = [
			new SECpopupPickerItem("test1", "あいう"),
			new SECpopupPickerItem("test2", "うえお"),
		];
	}

	// ----------------------------------------------------------------
	// 開く前の設定
	function beforeOpen(page : Page, cartridge : EventCartridge) : SECpopupPicker{
		return this.beforeOpen(page, cartridge, "ゲーム画質", this.settingItemList);
	}

	// ----------------------------------------------------------------
	// 閉じる直前の動作
	override function beforeClose(index : int) : void{
		super.beforeClose(index);
	}
}
*/

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

