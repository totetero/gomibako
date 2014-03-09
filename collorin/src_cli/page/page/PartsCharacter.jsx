import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報
class PartsCharacter{
	var code : string;
	var name : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(data : variant){
		this.code = data["code"] as string;
		this.name = data["name"] as string;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用キャラクターリストクラス
class PartsCharaListItem extends PartsCharacter{
	// HTMLタグ
	static const _htmlTag = """
		<div class="icon"></div>
		<div class="name"></div>
	""";

	// 並べ替え
	static function sort(list : PartsCharaListItem[], type : string) : void{
		// TODO
	}

	// ----------------------------------------------------------------

	var bodyDiv : HTMLDivElement;
	var iconDiv : HTMLDivElement;

	var select = false;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(data : variant){
		super(data);
		this.bodyDiv = dom.document.createElement("div") as HTMLDivElement;
		this.bodyDiv.innerHTML = PartsCharaListItem._htmlTag;
		this.bodyDiv.className = "core-charaListItem";
		this.iconDiv = this.bodyDiv.getElementsByClassName("icon").item(0) as HTMLDivElement;
		(this.bodyDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this.name;
		this.iconDiv.style.backgroundImage = "url(" + Loader.b64imgs["b64_icon_" + this.code] + ")";

	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報ポップアップ
class SECpopupInfoChara extends SECpopup{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="sidebar"></div>
			<div class="name"></div>
			<div class="chara"></div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _data : PartsCharacter;
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge, data : PartsCharacter){
		this._page = page;
		this._cartridge = cartridge;
		this._data = data;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core infoChara";
		this.popupDiv.innerHTML = this._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		(this.windowDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._data.name;
		(this.windowDiv.getElementsByClassName("chara").item(0) as HTMLDivElement).style.backgroundImage = "url(" + Loader.b64imgs["b64_bust_" + this._data.code] + ")";

		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

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

