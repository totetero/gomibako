import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Util.jsx";

import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ポップアップに展開演出を付与する
abstract class SECpopup extends EventCartridge{
	var popupDiv : HTMLDivElement;
	var windowDiv : HTMLDivElement;
	function popupInit() : void{}
	function popupCalc(active : boolean) : boolean{return false;}
	function popupDispose() : void{}

	var _openStep = -5;

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this.popupDiv = Page.popupDiv;
		this.popupInit();
		this.popupDiv.style.opacity = "0";
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._openStep != 0){this._openStep++;}
		var active = (this._openStep == 0);
		if(!this.popupCalc(active) && active){this._openStep = 1;}
		var num = this._openStep / 5;
		this.popupDiv.style.opacity = (1 - Math.abs(num)) as string;
		Util.cssTranslate(this.windowDiv, Math.abs(num) * num * 50, 0);
		//Util.cssTransform(this.windowDiv, "scale(" + (1 - 0.1 * Math.abs(num)) + ")");
		return num < 1;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this.popupDispose();
		this.popupDiv.innerHTML = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

