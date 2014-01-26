import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./MyPage.jsx";
import "./WorldPage.jsx";
import "./game/GamePage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページクラス 継承して使う
abstract class Page extends EventPlayer{
	static var current : Page;
	static var lastHash : string = "none";
	// ページ親要素
	static var parentDiv : HTMLDivElement;
	// ヘッダ要素
	static var headerDiv : HTMLDivElement;
	static var titleDiv : HTMLDivElement;
	static var backDiv : HTMLDivElement;
	static var menuDiv : HTMLDivElement;

	// ページ機能の初期化
	static function init() : void{
		// DOM獲得
		Page.parentDiv = Ctrl.sdiv.getElementsByClassName("page").item(0) as HTMLDivElement;
		Page.headerDiv = Ctrl.sdiv.getElementsByClassName("header").item(0) as HTMLDivElement;
		Page.titleDiv = Page.headerDiv.getElementsByClassName("title").item(0) as HTMLDivElement;
		Page.backDiv = Page.headerDiv.getElementsByClassName("back").item(0) as HTMLDivElement;
		Page.menuDiv = Page.headerDiv.getElementsByClassName("menu").item(0) as HTMLDivElement;
	}

	// ページ機能の監視
	static function calc() : void{
		var currentHash = dom.window.location.hash;
		if(Page.lastHash != currentHash){
			Page.lastHash = currentHash;
			var nextPage : Page = null;
			// ページの選定
			if(currentHash.indexOf("game") == 1){nextPage = new GamePage();}
			else if(currentHash.indexOf("world") == 1){nextPage = new WorldPage();}
			else{nextPage = new MyPage();}
			if(Page.current == null || Page.current.name != nextPage.name){
				// ページ遷移
				nextPage.serialCutting(new SECtransitionsPage(nextPage));
				Page.current = nextPage;
			}else{
				// 同じページなのでページ遷移しない
				nextPage.dispose();
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
	var headerType : int = 0;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ボタンクラス
class PageButton{
	var div : HTMLDivElement;
	var active : boolean;
	var trigger : boolean;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.div = div;
	}

	// 計算
	function calc() : void{
		if(Ctrl.mdn){
			var box = this.div.getBoundingClientRect();
			var x0 = box.left - Ctrl.sx;
			var y0 = box.top - Ctrl.sy;
			var x1 = x0 + box.width;
			var y1 = y0 + box.height;
			this.active = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
		}else if(this.active){
			this.active = false;
			this.trigger = true;
		}
	}

	// 描画
	function draw() : void{
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

// ページ遷移エフェクト
class SECtransitionsPage extends EventCartridge{
	var currentPage : Page;
	var nextPage : Page;
	var next : boolean;
	var action : int = 0;

	// コンストラクタ
	function constructor(nextPage : Page){
		this.currentPage = Page.current;
		this.nextPage = nextPage;

		if(this.currentPage){
			this.next = (this.currentPage.depth <= this.nextPage.depth);
			if(this.next){
				// 進む場合は初期位置の変更
				this.nextPage.div.style.left = "320px";
			}else{
				// 戻る場合は重ね順の変更
				Page.parentDiv.insertBefore(this.nextPage.div, this.currentPage.div);
			}
		}else{
			// 一番最初はヘッダを隠しておく
			Page.headerDiv.style.top = "-48px";
		}
	}

	// 計算
	override function calc() : boolean{
		return (this.action++ < 10);
	}

	// 描画
	override function draw() : void{
		var num = this.action / 10;

		// ヘッダの作成
		var isBeforeHeader = (this.currentPage != null && this.currentPage.headerType > 0);
		var isAfterHeader = (this.nextPage.headerType > 0);
		if(this.action == 1){
			Page.titleDiv.innerHTML = "";
			Page.backDiv.innerHTML = "";
			Page.menuDiv.innerHTML = "";
		}else if(this.action == 10){
			if(isAfterHeader){
				Page.titleDiv.innerHTML = this.nextPage.name;
				Page.backDiv.innerHTML = (this.nextPage.headerType == 1) ? "top" : "back";
				Page.menuDiv.innerHTML = "menu";
				Page.headerDiv.style.top = "0px";
			}else{
				Page.headerDiv.style.top = "-48px";
			}
		}
		if(!isBeforeHeader && isAfterHeader){
			// ヘッダの展開演出
			Page.headerDiv.style.top = Math.floor(-48 * (1 - num * num)) + "px";
		}else if(isBeforeHeader && !isAfterHeader){
			// ヘッダの収納演出
			Page.headerDiv.style.top = Math.floor(-48 * (num * num)) + "px";
		}

		if(this.currentPage){
			// ページの遷移演出
			if(this.next){
				this.nextPage.div.style.left = Math.floor(320 * (1 - num * num)) + "px";
			}else{
				this.currentPage.div.style.left = Math.floor(320 * (num * num)) + "px";
			}
		}
	}

	// 破棄
	override function dispose() : void{
		if(this.currentPage){this.currentPage.dispose();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

