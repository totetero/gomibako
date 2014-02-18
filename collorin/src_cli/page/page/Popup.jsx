import "js/web.jsx";

import "../../util/EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

abstract class SECpopup extends EventCartridge{
	var popup : HTMLDivElement;
	var window : HTMLDivElement;
	function popupInit() : void{}
	function popupCalc(active : boolean) : boolean{return false;}
	function popupDispose() : void{}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this.popupInit();
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return this.popupCalc(true);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this.popupDispose();
		this.popup.innerHTML = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

