import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/SECtransition.jsx";

import "SECtestMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストページ
class PageTest extends Page{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "test";
		this.depth = 11;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECtransition(this, "/test", null, function(response : variant) : SerialEventCartridge{
			// クロス要素の展開処理
			this.ctrler.setLctrl(true);
			this.ctrler.setRctrl("テスト01", "テスト02", "テスト03", "テスト04");
			this.header.setType("テスト", "mypage");
			// 応答処理
			log response;
			return new SECtestMain(this);
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

