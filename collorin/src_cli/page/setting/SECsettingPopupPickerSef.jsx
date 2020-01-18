import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../core/popup/SECpopupPicker.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 効果音のピッカー
class SECsettingPopupPickerSef extends SECpopupPicker{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(page, cartridge, "効果音", [
			new SECpopupPickerItem("high", "音量大"),
			new SECpopupPickerItem("middle", "音量中"),
			new SECpopupPickerItem("low", "音量小"),
			new SECpopupPickerItem("off", "OFF")
		]);

		if(Sound.isSupported){
			var volume = dom.window.localStorage.getItem("setting_sefVolume");
			this.setSelectedItem(volume);
		}else{
			this.getItem("high").inactive = true;
			this.getItem("middle").inactive = true;
			this.getItem("low").inactive = true;
			this.setSelectedItem("off");
		}
	}

	// ----------------------------------------------------------------
	// オープンボタン作成
	override function createButton(x : int, y : int, w : int) : PartsButtonPickerOpener{
		var openButton = super.createButton(x, y, w);
		openButton.inactive = !Sound.isSupported;
		return openButton;
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(tag : string) : void{
		Sound.setSefVolume(tag);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

