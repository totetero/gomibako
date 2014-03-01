import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";
import "../mypage/MyPage.jsx";
import "../world/WorldPage.jsx";
import "../quest/QuestPage.jsx";
import "../chara/CharaPage.jsx";
import "../item/ItemPage.jsx";
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
			else{nextPage = new MyPage();}
			if(Page.current == null || Page.current.name != nextPage.name){
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
	// プロパティ
	var name : string;
	var depth : int = 0; // 深度 画面遷移時の演出に影響

	// 開始直前の初期化処理
	function init() : void{}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ボタンクラス
class PageButton{
	var div : HTMLDivElement;
	var active : boolean;
	var inactive : boolean;
	var trigger : boolean;
	var _inner : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(div : HTMLDivElement, inner : boolean){
		this.div = div;
		this._inner = inner;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		if(this.inactive){
			// ボタン無効状態
			this.active = false;
		}else if(Ctrl.mdn){
			// ボタン押下中
			var box = this.div.getBoundingClientRect();
			var x0 = box.left - Ctrl.sx;
			var y0 = box.top - Ctrl.sy;
			var x1 = x0 + box.width;
			var y1 = y0 + box.height;
			var inner = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
			this.active = (clickable && (inner == this._inner));
		}else if(this.active){
			// ボタンを放した瞬間
			this.active = false;
			this.trigger = true;
		}
		// 押下描画
		var isActive = this.div.className.indexOf(" active") >= 0;
		if(this.active && !isActive){this.div.className += " active";}
		else if(!this.active && isActive){this.div.className = this.div.className.replace(/ active/g , "");}
		// 無効化描画
		var isInactive = this.div.className.indexOf(" inactive") >= 0;
		if(this.inactive && !isInactive){this.div.className += " inactive";}
		else if(!this.inactive && isInactive){this.div.className = this.div.className.replace(/ inactive/g , "");}

	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

