import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

import "../popup/SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報
class DataChara{
	var id : string;
	var code : string;
	var name : string;
	var level : int;
	var hp : int;
	var sp : int;
	var maxhp : int;
	var maxsp : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		this.id = response["id"] as string;
		this.code = response["code"] as string;
		this.name = response["name"] as string;
		this.level = response["level"] as int;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

