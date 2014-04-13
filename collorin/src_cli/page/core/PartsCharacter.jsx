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

// キャラクター情報
class PartsCharacter{
	var id : string;
	var code : string;
	var name : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		this.id = response["id"] as string;
		this.code = response["code"] as string;
		this.name = response["name"] as string;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用キャラクターリストクラス
class PartsCharaListItem extends PartsCharacter{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-chara-icon"></div>
		<div class="core-chara-name"></div>
		<div class="core-chara-level">Lv.999</div>
		<div class="core-chara-sphere"></div>
		<div class="core-chara-sphere"></div>
		<div class="core-chara-sphere"></div>
		<div class="core-chara-gauge hp"><div class="param"></div><div class="wrap"></div></div>
		<div class="core-chara-gauge sp"><div class="param"></div><div class="wrap"></div></div>
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
	function constructor(response : variant){
		super(response);
		this.bodyDiv = dom.document.createElement("div") as HTMLDivElement;
		this.bodyDiv.className = "core-chara-item";
		this.bodyDiv.innerHTML = PartsCharaListItem._htmlTag;
		// アイコン設定
		this.iconDiv = this.bodyDiv.getElementsByClassName("core-chara-icon").item(0) as HTMLDivElement;
		this.iconDiv.className = "core-chara-icon cssimg_icon_" + this.code;
		// 名前設定
		(this.bodyDiv.getElementsByClassName("core-chara-name").item(0) as HTMLDivElement).innerHTML = this.name;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報ポップアップ
class SECpopupInfoChara extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
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
		this.popupDiv.innerHTML = SECpopupInfoChara._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		(this.windowDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._data.name;
		(this.windowDiv.getElementsByClassName("chara").item(0) as HTMLDivElement).className = "chara cssimg_bust_" + this._data.code;

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

