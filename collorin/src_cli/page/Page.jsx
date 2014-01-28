import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "../util/Util.jsx";
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
	static var containerDiv : HTMLDivElement;
	// ヘッダ要素
	static var headerDiv : HTMLDivElement;
	static var titleDiv : HTMLDivElement;
	static var backDiv : HTMLDivElement;
	static var menuDiv : HTMLDivElement;

	// ページ機能の初期化
	static function init() : void{
		// DOM獲得
		Page.containerDiv = Ctrl.sdiv.getElementsByClassName("pageContainer").item(0) as HTMLDivElement;
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
				nextPage.init();
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

	// 開始直前の初期化処理
	function init() : void{}

	// 破棄
	override function dispose() : void{
		super.dispose();
		if(Page.containerDiv.contains(this.div)){Page.containerDiv.removeChild(this.div);}
		this.div = null;
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

		// ページのdivを配置、設定
		if(this.currentPage != null){
			this.next = (this.currentPage.depth <= this.nextPage.depth);
			if(this.next){
				Page.containerDiv.appendChild(this.nextPage.div);
				// 進む場合は初期位置の変更
				Util.cssTranslate(this.nextPage.div, 320, 0);
			}else{
				// 戻る場合は重ね順を考慮して配置
				Page.containerDiv.insertBefore(this.nextPage.div, this.currentPage.div);
			}
		}else{
			Page.containerDiv.appendChild(this.nextPage.div);
			// 一番最初はヘッダを隠しておく
			Util.cssTranslate(Page.headerDiv, 0, -48);
		}
	}

	// 計算
	override function calc() : boolean{
		return (this.action++ < 10);
	}

	// 描画
	override function draw() : void{
		var num = this.action / 10;

		// ヘッダの存在確認
		var isBeforeHeader = (this.currentPage != null && this.currentPage.headerType > 0);
		var isAfterHeader = (this.nextPage.headerType > 0);
		// ヘッダの形成
		if(this.action == 1){
			Page.titleDiv.innerHTML = "";
			Page.backDiv.innerHTML = "";
			Page.menuDiv.innerHTML = "";
		}else if(this.action == 10){
			if(isAfterHeader){
				Page.titleDiv.innerHTML = this.nextPage.name;
				Page.backDiv.innerHTML = (this.nextPage.headerType == 1) ? "top" : "back";
				Page.menuDiv.innerHTML = "menu";
				Util.cssTranslate(Page.headerDiv, 0, 0);
			}else{
				Util.cssTranslate(Page.headerDiv, 0, -48);
			}
		}
		if(!isBeforeHeader && isAfterHeader){
			// ヘッダの展開演出
			Util.cssTranslate(Page.headerDiv, 0, -48 * (1 - num * num));
		}else if(isBeforeHeader && !isAfterHeader){
			// ヘッダの収納演出
			Util.cssTranslate(Page.headerDiv, 0, -48 * (num * num));
		}

		if(this.currentPage != null){
			// ページの遷移演出
			if(this.next){
				Util.cssTranslate(this.nextPage.div, 320 * (1 - num * num), 0);
			}else{
				Util.cssTranslate(this.currentPage.div, 320 * (num * num), 0);
			}
		}
	}

	// 破棄
	override function dispose() : void{
		if(this.currentPage != null){this.currentPage.dispose();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

