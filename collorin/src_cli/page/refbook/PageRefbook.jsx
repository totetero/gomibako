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

import "../core/load/SECloadTransition.jsx";
import "SECrefbookMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 図鑑ページ
class PageRefbook extends Page{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "refbook";
		this.depth = 11;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECloadTransition(this, "/refbook", null, function(response : variant) : void{
			// クロス要素設定
			this.header.setType("図鑑", "mypage");
			this.bust.set(null);
			// カートリッジ装填
			this.serialPush(new SECrefbookMain(this, response));
		}));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

