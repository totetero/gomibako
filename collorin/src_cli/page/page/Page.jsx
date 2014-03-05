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
		if(this.inactive || !clickable){
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
			this.active = (inner == this._inner);
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

// ページ用スクロールクラス
class PageScroll{
	var containerDiv : HTMLDivElement;
	var scrollDiv : HTMLDivElement;
	var xbarDiv : HTMLDivElement;
	var ybarDiv : HTMLDivElement;
	var btnList : Map.<PageButton>;
	var active : boolean;
	var inactive : boolean;
	var scrollx : number;
	var scrolly : number;
	var _speedx : number;
	var _speedy : number;
	var _mdn : boolean;
	var _prevmx : int;
	var _prevmy : int;
	var _tempsw : int;
	var _tempsh : int;
	var _tempscrollx : number;
	var _tempscrolly : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(containerDiv : HTMLDivElement, scrollDiv : HTMLDivElement, xbarDiv : HTMLDivElement, ybarDiv : HTMLDivElement){
		this.containerDiv = containerDiv;
		this.scrollDiv = scrollDiv;
		this.xbarDiv = xbarDiv;
		this.ybarDiv = ybarDiv;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		var cbox = this.containerDiv.getBoundingClientRect();
		var sbox = this.scrollDiv.getBoundingClientRect();

		// スクロール開始終了の確認
		if(this._mdn != Ctrl.mdn){
			this._mdn = Ctrl.mdn;
			if(this.inactive || !clickable){
				// スクロール無効状態
				this.active = false;
			}else if(this._mdn){
				var x0 = cbox.left - Ctrl.sx;
				var y0 = cbox.top - Ctrl.sy;
				var x1 = x0 + cbox.width;
				var y1 = y0 + cbox.height;
				this.active = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
				this._prevmx = Ctrl.mx;
				this._prevmy = Ctrl.my;
			}else{
				this.active = false;
			}
		}

		// スクロール処理
		if(this.active && Ctrl.mmv){
			this._speedx = Ctrl.mx - this._prevmx + this._speedx * 0.3;
			this._speedy = Ctrl.my - this._prevmy + this._speedy * 0.3;
			this.scrollx += Ctrl.mx - this._prevmx;
			this.scrolly += Ctrl.my - this._prevmy;
			this._prevmx = Ctrl.mx;
			this._prevmy = Ctrl.my;
		}else{
			this._speedx *= 0.8;
			this._speedy *= 0.8;
			this.scrollx += this._speedx;
			this.scrolly += this._speedy;
		}
		var maxx = sbox.width - cbox.width;
		var maxy = sbox.height - cbox.height;
		if(this.scrollx < -maxx){this.scrollx = -maxx;}
		if(this.scrolly < -maxy){this.scrolly = -maxy;}
		if(this.scrollx > 0){this.scrollx = 0;}
		if(this.scrolly > 0){this.scrolly = 0;}

		// スクロール内ボタン処理
		if(this.btnList != null){
			for(var name in this.btnList){
				this.btnList[name].calc(this.active && !Ctrl.mmv);
			}
		}

		// スクロール描画
		var dx = Math.abs(this._tempscrollx - this.scrollx);
		var dy = Math.abs(this._tempscrolly - this.scrolly);
		if(dx > 0.5 || dy > 0.5){
			this._tempscrollx = this.scrollx;
			this._tempscrolly = this.scrolly;
			Util.cssTranslate(this.scrollDiv, this.scrollx, this.scrolly);
		}
		// スクロールバー描画
		if(dx > 0.5 || dy > 0.5 || this._tempsw != Ctrl.sw || this._tempsh != Ctrl.sh){
			this._tempsw = Ctrl.sw;
			this._tempsh = Ctrl.sh;
			if(this.xbarDiv != null){
				if(cbox.width < sbox.width){
					this.xbarDiv.style.left = (-this.scrollx * cbox.width / sbox.width) + "px";
					this.xbarDiv.style.width = (cbox.width * cbox.width / sbox.width) + "px";
				}else{
					this.xbarDiv.style.width = "0px";
				}
			}
			if(this.ybarDiv != null){
				if(cbox.height < sbox.height){
					this.ybarDiv.style.top = (-this.scrolly * cbox.height / sbox.height) + "px";
					this.ybarDiv.style.height = (cbox.height * cbox.height / sbox.height) + "px";
				}else{
					this.ybarDiv.style.height = "0px";
				}
			}
		}


		// 押下描画
		var isActive = this.containerDiv.className.indexOf(" active") >= 0;
		if(this.active && !isActive){this.containerDiv.className += " active";}
		else if(!this.active && isActive){this.containerDiv.className = this.containerDiv.className.replace(/ active/g , "");}
		// 無効化描画
		var isInactive = this.containerDiv.className.indexOf(" inactive") >= 0;
		if(this.inactive && !isInactive){this.containerDiv.className += " inactive";}
		else if(!this.inactive && isInactive){this.containerDiv.className = this.containerDiv.className.replace(/ inactive/g , "");}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

