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

// ページ遷移演出のピッカー
class SECsettingPopupPickerTransition extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "ページ遷移演出", [
			new SECpopupPickerItem("on", "ON"),
			new SECpopupPickerItem("off", "OFF")
		]);

		var transition = dom.window.localStorage.getItem("setting_transition");
		if(transition != "off"){transition = "on";}
		this.setSelectedItem(transition);
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		dom.window.localStorage.setItem("setting_transition", tag);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

