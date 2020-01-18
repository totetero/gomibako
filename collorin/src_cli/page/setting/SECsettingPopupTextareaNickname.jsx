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

import "../core/load/SECload.jsx";
import "../core/popup/SECpopupTextarea.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ニックネームのテキストエリア
class SECsettingPopupTextareaNickname extends SECpopupTextarea{
	var _prevValue : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, response : variant){
		super(page, cartridge, "ニックネーム設定", 8);
		this._parse(response);
		this.isPermitZero = false;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		if(value != this._prevValue){
			this.page.serialPush(new SECload(this, "/setting?nickname=" + value, null, function(response : variant) : void{
				this._parse(response);
			}));
		}
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function _parse(response : variant) : void{
		var value = response["nickname"] as string;
		this.setValue(value);
		this._prevValue = value;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

