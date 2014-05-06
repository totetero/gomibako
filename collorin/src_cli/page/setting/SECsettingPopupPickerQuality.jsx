
import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/SECpopupPicker.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 画質のピッカー
class SECsettingPopupPickerQuality extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "ゲーム画質", [
			new SECpopupPickerItem("high", "高画質"),
			new SECpopupPickerItem("middle", "普通画質"),
			new SECpopupPickerItem("low", "低画質")
		]);

		if(dom.window.devicePixelRatio <= 1){this.getItem("high").inactive = true;}

		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality != "high" && quality != "low"){quality = "middle";}
		this.setSelectedItem(quality);
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		dom.window.localStorage.setItem("setting_quality", tag);
		Ctrl.setCanvas();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

