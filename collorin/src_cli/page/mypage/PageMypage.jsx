import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/SECtransition.jsx";

import "SECmypageMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストページ
class PageMypage extends Page{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "mypage";
		this.depth = 1;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECtransition(this, "/mypage", null, function(response : variant) : void{
			// クロス要素の展開処理
			this.ctrler.setLctrl(false);
			this.ctrler.setRctrl("", "", "", "");
			this.header.setType("マイページ", "top");
			// カートリッジ装填
			log response;
			this.serialPush(new SECmypageMain(this));
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

