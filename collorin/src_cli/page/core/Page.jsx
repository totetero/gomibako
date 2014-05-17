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

import "cross/CrossCtrler.jsx";
import "cross/CrossHeader.jsx";
import "cross/CrossBust.jsx";

import "../mypage/PageMypage.jsx";
//import "../world/PageWorld.jsx";
import "../chara/PageChara.jsx";
import "../setting/PageSetting.jsx";
//import "../dice/PageDice.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページクラス 継承して使う
abstract class Page extends EventPlayer{
	static var current : Page;
	static var _coreLoaded = false;
	static var _lastHash : string = "none";

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Loading.show();
		Loader.loadContents("core", function() : void{
			Loading.hide();
			Page._coreLoaded = true;
		});
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		if(Page._coreLoaded){
			// ハッシュの監視とページ遷移
			var currentHash = dom.window.location.hash;
			if(Page._lastHash != currentHash){
				Page._lastHash = currentHash;
				var nextPage = Page._nextPage(currentHash);
				if(Page.current == null || Page.current.type != nextPage.type || Page.current.depth != nextPage.depth){
					// ページをまたぐ機能を継承
					nextPage.ctrler = (Page.current == null) ? new CrossCtrler() : Page.current.ctrler;
					nextPage.header = (Page.current == null) ? new CrossHeader() : Page.current.header;
					nextPage.bust = (Page.current == null) ? new CrossBust() : Page.current.bust;
					// ページ遷移
					nextPage.init();
					Page.current = nextPage;
				}
			}
		}

		if(Page.current != null){
			// ページの計算
			Page.current.calc();
			Page.current.ctrler.calc();
			Page.current.header.calc();
			Page.current.bust.calc();			
			// ページの描画
			if(Ctrl.update_lctx){Ctrl.lctx.clearRect(0, 0, 160, 240);}
			if(Ctrl.update_rctx){Ctrl.rctx.clearRect(0, 0, 144, 244);}
			Page.current.draw();
			Page.current.bust.draw();			
			Page.current.ctrler.draw();
			Ctrl.update_lctx = false;
			Ctrl.update_rctx = false;
		}
	}

	// 次ページ作成関数
	static function _nextPage(hash : string) : Page{
//		if(hash.indexOf("dice") == 1){return new PageDice();}
//		if(hash.indexOf("world") == 1){return new PageWorld();}
		if(hash.indexOf("chara") == 1){return new PageChara();}
		if(hash.indexOf("setting") == 1){return new PageSetting();}
		return new PageMypage();
	}

	// ----------------------------------------------------------------

	// ページ遷移設定
	static function transitionsPage(name : string) : void{
		dom.window.location.hash = name;
	}

	// ----------------------------------------------------------------

	// クロス要素 (ページをまたぐ機能)
	var ctrler : CrossCtrler;
	var header : CrossHeader;
	var bust : CrossBust;

	// 画面遷移時演出用プロパティ
	var type : string;
	var depth : int = 0;
	// ページBGM
	var bgm = "";

	// 開始直前の初期化処理
	function init() : void{}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

