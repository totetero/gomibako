import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "CrossCtrler.jsx";
import "CrossHeader.jsx";
import "../mypage/PageMypage.jsx";
import "../world/PageWorld.jsx";
import "../chara/PageChara.jsx";
import "../setting/PageSetting.jsx";
import "../dice/PageDice.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページクラス 継承して使う
abstract class Page extends EventPlayer{
	static var current : Page;
	static var _lastHash : string = "none";
	static var _coreLoaded = false;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Loading.show();
		Loader.loadContents("core", function() : void{
			Loading.hide();
			Page._coreLoaded = true;
			Page.checkHash();
		});
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ページ遷移の監視
		if(Page._coreLoaded){Page.checkHash();}

		if(Page.current != null){
			// ページの計算
			Page.current.calc();
			Page.current.ctrler.calc();
			Page.current.header.calc();
			// ページの描画
			Page.current.draw();
			Page.current.ctrler.draw();
		}
	}

	// ページ遷移確認
	static function checkHash() : void{
		var currentHash = dom.window.location.hash;
		if(Page._lastHash != currentHash){
			Page._lastHash = currentHash;
			var nextPage : Page = null;
			if(currentHash.indexOf("dice") == 1){nextPage = new PageDice();}
			else if(currentHash.indexOf("world") == 1){nextPage = new PageWorld();}
			else if(currentHash.indexOf("chara") == 1){nextPage = new PageChara();}
			else if(currentHash.indexOf("setting") == 1){nextPage = new PageSetting();}
			else{nextPage = new PageMypage();}
			if(Page.current == null || Page.current.type != nextPage.type || Page.current.depth != nextPage.depth){
				// ページをまたぐ機能を継承
				nextPage.ctrler = (Page.current == null) ? new CrossCtrler() : Page.current.ctrler;
				nextPage.header = (Page.current == null) ? new CrossHeader() : Page.current.header;
				// ページ遷移
				nextPage.init();
				Page.current = nextPage;
			}
		}
	}

	// ページ遷移設定
	static function transitionsPage(name : string) : void{
		dom.window.location.hash = name;
	}

	// ----------------------------------------------------------------

	// クロス要素 (ページをまたぐ機能)
	var ctrler : CrossCtrler;
	var header : CrossHeader;

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

