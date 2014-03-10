import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップ
class SECpopupMenu extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="core-btn world">ワールド</div>
			<div class="core-btn quest">クエスト</div>
			<div class="core-btn chara">キャラクター</div>
			<div class="core-btn item">アイテム</div>
			<div class="core-btn friend">友達</div>
			<div class="core-btn refbook">図鑑</div>
			<div class="core-btn setting">設定</div>
			<div class="core-btn help">ヘルプ</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PartsButton>;

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
		this.popupDiv.innerHTML = SECpopupMenu._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		this._btnList = {} : Map.<PartsButton>;
		this._btnList["world"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn world").item(0) as HTMLDivElement, true);
		this._btnList["quest"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn quest").item(0) as HTMLDivElement, true);
		this._btnList["chara"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn chara").item(0) as HTMLDivElement, true);
		this._btnList["item"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn item").item(0) as HTMLDivElement, true);
		this._btnList["friend"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn friend").item(0) as HTMLDivElement, true);
		this._btnList["refbook"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn refbook").item(0) as HTMLDivElement, true);
		this._btnList["setting"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn setting").item(0) as HTMLDivElement, true);
		this._btnList["help"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn help").item(0) as HTMLDivElement, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);

		var current = this._btnList[Page.current.type];
		if(current != null){current.inactive = true;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// コンテンツボタン
		if(this._btnList["world"].trigger){this._btnList["world"].trigger = false; Page.transitionsPage("world");}
		if(this._btnList["quest"].trigger){this._btnList["quest"].trigger = false; Page.transitionsPage("quest");}
		if(this._btnList["chara"].trigger){this._btnList["chara"].trigger = false; Page.transitionsPage("chara");}
		if(this._btnList["item"].trigger){this._btnList["item"].trigger = false; Page.transitionsPage("item");}
		if(this._btnList["friend"].trigger){this._btnList["friend"].trigger = false; Page.transitionsPage("friend");}
		if(this._btnList["refbook"].trigger){this._btnList["refbook"].trigger = false; Page.transitionsPage("refbook");}
		if(this._btnList["setting"].trigger){this._btnList["setting"].trigger = false; Page.transitionsPage("setting");}
		if(this._btnList["help"].trigger){this._btnList["help"].trigger = false; Page.transitionsPage("help");}

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

