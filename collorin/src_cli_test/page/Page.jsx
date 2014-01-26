import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./MyPage.jsx";
import "./WorldPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページクラス 継承して使う
abstract class Page extends EventPlayer{
	static var current : Page;
	// ページ要素
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

		Page.current = new MyPage();
	}

	// ページ遷移
	static function transitionsPage(nextPage : Page, next : boolean) : void{
		nextPage.serialCutting(new SECtransitionsPage(Page.current, nextPage, next));
		Page.current = nextPage;
	}

	// ----------------------------------------------------------------

	var div : HTMLDivElement;
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
	function constructor(currentPage : Page, nextPage : Page, next : boolean){
		this.currentPage = currentPage;
		this.nextPage = nextPage;
		this.next = next;
		if(this.next){
			// 進む場合は初期位置の変更
			this.nextPage.div.style.left = "320px";
		}else{
			// 戻る場合は重ね順の変更
			Page.parentDiv.insertBefore(this.nextPage.div, this.currentPage.div);
		}
	}

	// 計算
	override function calc() : boolean{
		return (this.action++ < 10);
	}

	// 描画
	override function draw() : void{
		var num = this.action / 10;
		if(this.next){
			this.nextPage.div.style.left = Math.floor(320 * (1 - num * num)) + "px";
		}else{
			this.currentPage.div.style.left = Math.floor(320 * (num * num)) + "px";
		}
	}

	// 破棄
	override function dispose() : void{
		this.currentPage.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

