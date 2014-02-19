import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";
import "../mypage/MyPage.jsx";
import "../world/WorldPage.jsx";
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

// ページ情報読み込み
class SECloadPage extends EventCartridge{
	var _exist : boolean;
	var _url : string;
	var _request : variant;
	var _callback : function(response:variant):void;
	var _action = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(url : string, request : variant, callback : function(response:variant):void){
		this._exist = false;
		this._url = url;
		this._request = request;
		this._callback = callback;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(!this._exist){
			this._exist = true;
			// ページ情報ロード開始
			Loader.loadxhr(this._url, this._request, function(response : variant) : void{
				// ページ情報ロード成功 画像ロード
				Loader.loadImg(response["imgs"] as Map.<string>, function() : void{
					// 画像ロード成功
					this._callback(response);
					this._exist = false;
				}, function():void{
					// 画像ロード失敗
				});
			}, function() : void{
				// ページ情報ロード失敗
			});
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._action++;
		// ロード画面表示
		var display = ((this._exist || this._action < 15) && 5 < this._action) ? "block" : "none";
		if(Page.loadingDiv.style.display != display){Page.loadingDiv.style.display = display;}
		// ロード文字列描画
		if(this._action % 10 == 0){
			switch(this._action / 10 % 4){
				case 0: Page.loadingDiv.setAttribute("txt", "loading"); break;
				case 1: Page.loadingDiv.setAttribute("txt", "loading."); break;
				case 2: Page.loadingDiv.setAttribute("txt", "loading.."); break;
				case 3: Page.loadingDiv.setAttribute("txt", "loading..."); break;
			}
		}
		return (this._exist || (5 < this._action && this._action < 15));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ボタンクラス
class PageButton{
	var div : HTMLDivElement;
	var active : boolean;
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
		if(Ctrl.mdn){
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
		// 描画
		var isActive = this.div.className.indexOf(" active") >= 0;
		if(this.active && !isActive){
			this.div.className += " active";
		}else if(!this.active && isActive){
			this.div.className = this.div.className.replace(/ active/g , "");
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

