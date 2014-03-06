import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップ
abstract class SECpopupPicker extends SECpopup{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
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
		this.popupDiv.className = "core-popup core picker";
		this.popupDiv.innerHTML = this._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

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

