import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップ
class SECpopupMenu extends SECpopup{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="core-btn world">ワールド</div>
			<div class="core-btn quest">クエスト</div>
			<div class="core-btn chara">キャラクター</div>
			<div class="core-btn item">アイテム</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge){
		this._page = page;
		this._cartridge = cartridge;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core menu";
		this.popupDiv.innerHTML = this._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		this._btnList = {} : Map.<PageButton>;
		this._btnList["world"] = new PageButton(this.windowDiv.getElementsByClassName("core-btn world").item(0) as HTMLDivElement, true);
		this._btnList["quest"] = new PageButton(this.windowDiv.getElementsByClassName("core-btn quest").item(0) as HTMLDivElement, true);
		this._btnList["chara"] = new PageButton(this.windowDiv.getElementsByClassName("core-btn chara").item(0) as HTMLDivElement, true);
		this._btnList["item"] = new PageButton(this.windowDiv.getElementsByClassName("core-btn item").item(0) as HTMLDivElement, true);
		this._btnList["close"] = new PageButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PageButton(this.windowDiv, false);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// コンテンツボタン
		if(this._btnList["world"].trigger){Page.transitionsPage("world");}
		if(this._btnList["quest"].trigger){Page.transitionsPage("quest");}
		if(this._btnList["chara"].trigger){Page.transitionsPage("chara");}
		if(this._btnList["item"].trigger){Page.transitionsPage("item");}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				this._page.serialPush(this._cartridge);
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

