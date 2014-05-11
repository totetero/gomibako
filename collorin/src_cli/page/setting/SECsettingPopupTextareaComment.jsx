import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/sec/SECload.jsx";
import "../core/sec/SECpopupTextarea.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コメントのテキストエリア
class SECsettingPopupTextareaComment extends SECpopupTextarea{
	var _prevValue : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, response : variant){
		super(page, cartridge, "コメント設定", 16);
		this._parse(response);
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		if(value != this._prevValue){
			this.page.serialPush(new SECload(this, "/setting?comment=" + value, null, function(response : variant) : void{
				this._parse(response);
			}));
		}
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function _parse(response : variant) : void{
		var value = response["comment"] as string;
		this.setValue(value);
		this._prevValue = value;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

