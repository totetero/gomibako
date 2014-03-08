import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";
import "../mypage/MyPage.jsx";
import "../world/WorldPage.jsx";
import "../quest/QuestPage.jsx";
import "../chara/CharaPage.jsx";
import "../item/ItemPage.jsx";
import "../friend/FriendPage.jsx";
import "../setting/SettingPage.jsx";
import "../refbook/RefbookPage.jsx";
import "../help/HelpPage.jsx";
import "../dice/DicePage.jsx";
import "../chat/ChatPage.jsx";

import "Transition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページクラス 継承して使う
abstract class Page extends EventPlayer{
	static var current : Page;
	static var _lastHash : string = "none";
	// ページ親要素
	static var containerDiv : HTMLDivElement;
	// ヘッダ要素
	static var headerDiv : HTMLDivElement;
	static var titleDiv : HTMLDivElement;
	static var backDiv : HTMLDivElement;
	static var menuDiv : HTMLDivElement;
	// ポップアップ要素
	static var popupDiv : HTMLDivElement;
	// キャラクター要素
	static var characterDiv : HTMLDivElement;
	// ロード画面要素
	static var loadingDiv : HTMLDivElement;

	// ページ機能の初期化
	static function init() : void{
		// DOM獲得
		Page.containerDiv = Ctrl.sDiv.getElementsByClassName("pageContainer").item(0) as HTMLDivElement;
		Page.headerDiv = Ctrl.sDiv.getElementsByClassName("header").item(0) as HTMLDivElement;
		Page.titleDiv = Page.headerDiv.getElementsByClassName("title").item(0) as HTMLDivElement;
		Page.backDiv = Page.headerDiv.getElementsByClassName("back").item(0) as HTMLDivElement;
		Page.menuDiv = Page.headerDiv.getElementsByClassName("menu").item(0) as HTMLDivElement;
		Page.popupDiv = Ctrl.sDiv.getElementsByClassName("core-popup").item(0) as HTMLDivElement;
		Page.characterDiv = dom.document.getElementById("character") as HTMLDivElement;
		Page.loadingDiv = dom.document.getElementById("loading") as HTMLDivElement;
		// 一番最初はヘッダを隠しておく
		Util.cssTranslate(Page.headerDiv, 0, PECopenHeader.hide);
		Util.cssTranslate(Ctrl.lDiv, PECopenLctrl.hide, 0);
		Util.cssTranslate(Ctrl.rDiv, PECopenRctrl.hide, 0);
		Util.cssTranslate(Page.characterDiv, PECopenCharacter.hide, 0);
	}

	// ページ機能の監視
	static function calc() : void{
		var currentHash = dom.window.location.hash;
		if(Page._lastHash != currentHash){
			Page._lastHash = currentHash;
			var nextPage : Page = null;
			// ページの選定
			if(currentHash.indexOf("dice") == 1){nextPage = new DicePage();}
			else if(currentHash.indexOf("chat") == 1){nextPage = new ChatPage();}
			else if(currentHash.indexOf("world") == 1){nextPage = new WorldPage();}
			else if(currentHash.indexOf("quest") == 1){nextPage = new QuestPage();}
			else if(currentHash.indexOf("chara") == 1){nextPage = new CharaPage();}
			else if(currentHash.indexOf("item") == 1){nextPage = new ItemPage();}
			else if(currentHash.indexOf("friend") == 1){nextPage = new FriendPage();}
			else if(currentHash.indexOf("setting") == 1){nextPage = new SettingPage();}
			else if(currentHash.indexOf("refbook") == 1){nextPage = new RefbookPage();}
			else if(currentHash.indexOf("help") == 1){nextPage = new HelpPage();}
			else{nextPage = new MyPage();}
			if(Page.current == null || Page.current.type != nextPage.type || Page.current.depth != nextPage.depth){
				// ページ遷移
				nextPage.init();
				Page.current = nextPage;
			}
		}
	}

	// ページ遷移
	static function transitionsPage(name : string) : void{
		dom.window.location.hash = name;
	}

	// ----------------------------------------------------------------

	// ページ本体要素
	var div : HTMLDivElement;
	// 画面遷移時演出用プロパティ
	var type : string;
	var depth : int = 0;

	// 開始直前の初期化処理
	function init() : void{}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

