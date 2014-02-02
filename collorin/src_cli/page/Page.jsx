import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "../util/Util.jsx";
import "./MyPage.jsx";
import "./WorldPage.jsx";
import "./game/GamePage.jsx";
import "./ChatPage.jsx";

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
	// ロード画面要素
	static var loadingDiv : HTMLDivElement;

	// ページ機能の初期化
	static function init() : void{
		// DOM獲得
		Page.containerDiv = Ctrl.sdiv.getElementsByClassName("pageContainer").item(0) as HTMLDivElement;
		Page.headerDiv = Ctrl.sdiv.getElementsByClassName("header").item(0) as HTMLDivElement;
		Page.titleDiv = Page.headerDiv.getElementsByClassName("title").item(0) as HTMLDivElement;
		Page.backDiv = Page.headerDiv.getElementsByClassName("back").item(0) as HTMLDivElement;
		Page.menuDiv = Page.headerDiv.getElementsByClassName("menu").item(0) as HTMLDivElement;
		Page.loadingDiv = dom.document.getElementById("loading") as HTMLDivElement;
	}

	// ページ機能の監視
	static function calc() : void{
		var currentHash = dom.window.location.hash;
		if(Page._lastHash != currentHash){
			Page._lastHash = currentHash;
			var nextPage : Page = null;
			// ページの選定
			if(currentHash.indexOf("game") == 1){nextPage = new GamePage();}
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
	var headerType : int = 0;

	// 開始直前の初期化処理
	function init() : void{}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ情報読み込み
class SECloadPage extends EventCartridge{
	var exist : boolean;
	
	// コンストラクタ
	function constructor(url : string, request : variant, successFunc : function(response:variant):void){
		this.exist = true;
		// ページ情報ロード開始
		Loader.loadxhr(url, request, function(response : variant) : void{
			// ページ情報ロード成功 画像ロードテスト
			Loader.loadImg({
				player: "img/character/player0/dot.png",
				grid: "img/gridField/test.png"
			}, function() : void{
				// 画像ロード成功
				successFunc(response);
				this.exist = false;
			}, function():void{
				// 画像ロード失敗
			});
		}, function() : void{
			// ページ情報ロード失敗
		});
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		return this.exist;
	}

	// 描画
	override function draw() : void{
		// ロード画面描画
		var display = this.exist ? "block" : "none";
		if(Page.loadingDiv.style.display != display){
			Page.loadingDiv.style.display = display;
		}
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ遷移エフェクト
class SECtransitionsPage extends EventCartridge{
	var _currentPage : Page;
	var _nextPage : Page;
	var _next : boolean;
	var _action : int = 0;

	// コンストラクタ
	function constructor(nextPage : Page){
		this._currentPage = Page.current;
		this._nextPage = nextPage;

		// ページのdivを配置、設定
		Page.containerDiv.appendChild(this._nextPage.div);
		if(this._currentPage != null){
			this._next = (this._currentPage.depth <= this._nextPage.depth);
			if(this._next){
				// 進む場合は初期位置の変更
				Util.cssTranslate(this._nextPage.div, 320, 0);
			}else{
				// 戻る場合は重ね順を考慮して配置しなおし
				Page.containerDiv.appendChild(this._currentPage.div);
			}
		}else{
			// 一番最初はヘッダを隠しておく
			Util.cssTranslate(Page.headerDiv, 0, -48);
		}
	}

	// 計算
	override function calc() : boolean{
		return (++this._action < 10);
	}

	// 描画
	override function draw() : void{
		var num = this._action / 10;

		// ヘッダの存在確認
		var isBeforeHeader = (this._currentPage != null && this._currentPage.headerType > 0);
		var isAfterHeader = (this._nextPage.headerType > 0);
		// ヘッダの形成
		if(this._action == 1){
			Page.titleDiv.innerHTML = "";
			Page.backDiv.innerHTML = "";
			Page.menuDiv.innerHTML = "";
		}else if(this._action == 10){
			if(isAfterHeader){
				Page.titleDiv.innerHTML = this._nextPage.name;
				Page.backDiv.innerHTML = (this._nextPage.headerType == 1) ? "top" : "back";
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

		if(this._currentPage != null){
			// ページの遷移演出
			if(this._next){
				Util.cssTranslate(this._nextPage.div, 320 * (1 - num * num), 0);
			}else{
				Util.cssTranslate(this._currentPage.div, 320 * (num * num), 0);
			}
		}
	}

	// 破棄
	override function dispose() : void{
		if(this._currentPage != null){
			// 遷移後に元いたページの後片付け
			this._currentPage.dispose();
			Page.containerDiv.removeChild(this._currentPage.div);
		}
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

