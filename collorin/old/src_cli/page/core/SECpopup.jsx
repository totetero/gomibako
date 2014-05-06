import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Util.jsx";

import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ポップアップに展開演出を付与する
abstract class SECpopup extends EventCartridge{
	static var _keepPopup = false;
	var popupDiv : HTMLDivElement;
	var windowDiv : HTMLDivElement;
	function popupInit() : void{}
	function popupCalc(active : boolean) : boolean{return false;}
	function popupDispose() : void{}

	var _openStep : int;
	var _skip : boolean;

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this.popupDiv = Page.popupDiv;
		this.popupInit();
		this.popupDiv.style.opacity = SECpopup._keepPopup ? "0.8" : "0";
		this._openStep = -5;
		this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// ポップアップ計算と展開確認
		if(this._openStep != 0){this._openStep++;}
		var active = (this._openStep == 0);
		if(!this.popupCalc(active) && active){
			this._openStep = 1;
			SECpopup._keepPopup = (Page.current.getSerialNext() instanceof SECpopup);
			this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
		}
		if(this._skip && this._openStep < 0){this._openStep = 0;}
		if(this._skip && this._openStep > 0){this._openStep = 5;}
		if(this._openStep == 0){SECpopup._keepPopup = false;}

		// ポップアップ展開演出
		var num = this._openStep / 5;
		this.popupDiv.style.opacity = (1 - Math.abs(num) * (SECpopup._keepPopup ? 0.2 : 1)) as string;
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

