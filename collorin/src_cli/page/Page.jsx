import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "../util/Util.jsx";
import "./MyPage.jsx";
import "./WorldPage.jsx";
import "./dice/DicePage.jsx";
import "./chat/ChatPage.jsx";

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
		// 一番最初はヘッダを隠しておく
		Util.cssTranslate(Page.headerDiv, 0, PECopenHeader.hide);
		Util.cssTranslate(Ctrl.lDiv, -144, 0);
		Util.cssTranslate(Ctrl.rDiv, 144, 0);
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
	var headerType : int = 0;
	var lctrlType : int = 0;
	var rctrlType : int = 0;

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
	override function init() : void{
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
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._action++;
		return this._exist || (5 < this._action && this._action < 15);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
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
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ遷移エフェクト 直前ページの後片付けもこのカートリッジをトリガーにして行う
class SECtransitionsPage extends EventCartridge{
	var _currentPage : Page;
	var _nextPage : Page;
	var _next : boolean;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(nextPage : Page){
		this._currentPage = Page.current;
		this._nextPage = nextPage;

		if(this._currentPage != null){
			// 進行方向の確認
			this._next = (this._currentPage.depth <= this._nextPage.depth);
			// 直前ページのオブジェクト後片付け
			this._currentPage.dispose();
		}

		// ページのdivを配置、設定
		Page.containerDiv.appendChild(this._nextPage.div);
		if(this._currentPage != null){
			if(this._next){
				// 進む場合は初期位置の変更
				Util.cssTranslate(this._currentPage.div, 0, 0);
				Util.cssTranslate(this._nextPage.div, 320, 0);
			}else{
				// 戻る場合は重ね順を考慮して配置しなおし
				Page.containerDiv.appendChild(this._currentPage.div);
			}
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return (++this._action < 10);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var num = this._action / 10;
		this.drawLctrl(num);
		this.drawRctrl(num);
		if(this._currentPage != null){
			// ページの遷移演出
			if(this._next){
				Util.cssTranslate(this._nextPage.div, 320 * (1 - num * num), 0);
			}else{
				Util.cssTranslate(this._currentPage.div, 320 * (num * num), 0);
			}
		}
	}

	function drawLctrl(num : number) : void{
		// 左コントローラーの存在確認
		var isBeforeLctrl = (this._currentPage != null && this._currentPage.lctrlType > 0);
		var isAfterLctrl = (this._nextPage.lctrlType > 0);
		// 左コントローラーの形成
		if(this._action == 1){
		}else if(this._action == 10){
			if(isAfterLctrl){
				Util.cssTranslate(Ctrl.lDiv, 0, 0);
			}else{
				Util.cssTranslate(Ctrl.lDiv, -144, 0);
			}
		}
		if(!isBeforeLctrl && isAfterLctrl){
			// 左コントローラーの展開演出
			Util.cssTranslate(Ctrl.lDiv, -144 * (1 - num * num), 0);
		}else if(isBeforeLctrl && !isAfterLctrl){
			// 左コントローラーの収納演出
			Util.cssTranslate(Ctrl.lDiv, -144 * (num * num), 0);
		}
	}

	function drawRctrl(num : number) : void{
		// 左コントローラーの存在確認
		var isBeforeRctrl = (this._currentPage != null && this._currentPage.rctrlType > 0);
		var isAfterRctrl = (this._nextPage.rctrlType > 0);
		// 左コントローラーの形成
		if(this._action == 1){
		}else if(this._action == 10){
			if(isAfterRctrl){
				Util.cssTranslate(Ctrl.rDiv, 0, 0);
			}else{
				Util.cssTranslate(Ctrl.rDiv, 144, 0);
			}
		}
		if(!isBeforeRctrl && isAfterRctrl){
			// 左コントローラーの展開演出
			Util.cssTranslate(Ctrl.rDiv, 144 * (1 - num * num), 0);
		}else if(isBeforeRctrl && !isAfterRctrl){
			// 左コントローラーの収納演出
			Util.cssTranslate(Ctrl.rDiv, 144 * (num * num), 0);
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(this._currentPage != null){
			// 直前ページのDOM後片付け
			Page.containerDiv.removeChild(this._currentPage.div);
		}
	}
}

// ヘッダの展開
class PECopenHeader extends EventCartridge{
	static const hide = -48;
	static var _current : PECopenHeader;
	static var _position = PECopenHeader.hide;
	var _name : string;
	var _type : int;
	var _start : int;
	var _goal : int;
	var _action : int = 0;
	var _exist = true;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(name : string, type : int){
		this._name = name;
		this._type = type;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// 動作重複禁止
		if(PECopenHeader._current != null){PECopenHeader._current._exist = false;}
		PECopenHeader._current = this;
		// 位置記録
		this._start = PECopenHeader._position;
		this._goal = (this._type > 0) ? 0 : PECopenHeader.hide;
		// 初期形成
		Page.titleDiv.innerHTML = "";
		Page.backDiv.innerHTML = "";
		Page.menuDiv.innerHTML = "";
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			this._action++;
			PECopenHeader._position = this._start + (this._goal - this._start) * (this._action / 10);
			return (this._action < 10);
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		if(this._exist){
			if(this._start != this._goal){Util.cssTranslate(Page.headerDiv, 0, PECopenHeader._position);}
			if(this._action == 10){
				// 最終形成
				Page.titleDiv.innerHTML = this._name;
				Page.backDiv.innerHTML = (this._type == 1) ? "top" : "back";
				Page.menuDiv.innerHTML = "menu";
			}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECopenHeader._current == this){PECopenHeader._current = null;}
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
			this.active = false;
			this.trigger = true;
		}
	}

	// ----------------------------------------------------------------
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

