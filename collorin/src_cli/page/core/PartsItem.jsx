import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// アイテム情報
class PartsItem{
	var id : string;
	var code : string;
	var name : string;
	var num : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		this.id = response["id"] as string;
		this.code = response["code"] as string;
		this.name = response["name"] as string;
		this.num = response["num"] as int;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用アイテムリストクラス
class PartsItemListItem extends PartsItem{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-item-icon"></div>
		<div class="core-item-name"></div>
		<div class="core-item-type"></div>
		<div class="core-item-value"></div>
	""";

	// 並べ替え
	static function sort(list : PartsItemListItem[], type : string) : void{
		// TODO
	}

	// ----------------------------------------------------------------

	var bodyDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(response);
		this.bodyDiv = dom.document.createElement("div") as HTMLDivElement;
		this.bodyDiv.className = "core-item-listItem";
		this.bodyDiv.innerHTML = PartsItemListItem._htmlTag;
		// アイコン設定
		(this.bodyDiv.getElementsByClassName("core-item-icon").item(0) as HTMLDivElement).className = "core-item-icon cssimg_icon_" + this.code;
		// 名前設定
		(this.bodyDiv.getElementsByClassName("core-item-name").item(0) as HTMLDivElement).innerHTML = this.name;
		// タイプ設定
		(this.bodyDiv.getElementsByClassName("core-item-type").item(0) as HTMLDivElement).innerHTML = "武器";
		// 個数設定
		(this.bodyDiv.getElementsByClassName("core-item-value").item(0) as HTMLDivElement).innerHTML = this.num + "個";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// アイテム情報ポップアップ
class SECpopupInfoItem extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="sidebar"></div>
			<div class="name"></div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _data : PartsItem;
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge, data : PartsItem){
		this._page = page;
		this._cartridge = cartridge;
		this._data = data;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core infoItem";
		this.popupDiv.innerHTML = SECpopupInfoItem._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		(this.windowDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._data.name;

		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["close"].sKey = true;
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
				Sound.playSE("ng");
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

