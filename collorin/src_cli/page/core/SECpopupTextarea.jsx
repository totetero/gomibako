import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テキストエリアポップアップ
abstract class SECpopupTextarea extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="window">
			<div class="core-btn ok">決定</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PartsButton>;
	var _input : HTMLInputElement;
	var _value : string;
	var _max : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge, value : string, max : int){
		this._page = page;
		this._cartridge = cartridge;
		this._value = value;
		this._max = max;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core textarea";
		this.popupDiv.innerHTML = SECpopupTextarea._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("window").item(0) as HTMLDivElement;

		this._input = Ctrl.sDiv.getElementsByTagName("input").item(0) as HTMLInputElement;
		this._input.type = "text";
		this._input.value = this._value;
		this._input.maxLength = this._max;

		this._btnList = {} : Map.<PartsButton>;
		this._btnList["ok"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn ok").item(0) as HTMLDivElement, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テキストエリア表示
		if(active && this._input.className != "core textarea"){this._input.className = "core textarea";}

		// ボタン押下時
		if(this._btnList["ok"].trigger || this._btnList["close"].trigger){
			var ok = this._btnList["ok"].trigger;
			this._btnList["ok"].trigger = false;
			this._btnList["close"].trigger = false;
			if(active){
				Sound.playSE(ok ? "ok" : "ng");
				if(ok){this.enter(this._input.value);}
				this._input.className = "";
				this._page.serialPush(this._cartridge);
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作 継承用
	function enter(value : string) : void{
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

