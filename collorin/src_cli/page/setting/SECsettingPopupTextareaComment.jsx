import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/SECpopupTextarea.jsx";

import "PageSetting.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コメントのテキストエリア
class SECsettingPopupTextareaComment extends SECpopupTextarea{
	var _sPage : PageSetting;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageSetting, cartridge : SerialEventCartridge){
		super(page, cartridge, "コメント設定", 16);
		this.setValue("げんきかえ？"); // TODO
		this._sPage = page;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		//if(value != this._sPage.comment){
		//	this._sPage.serialPush(new SECload("/setting?comment=" + value, null, function(response : variant) : void{this._sPage.parse(response);}));
		//}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

