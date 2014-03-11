import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";

import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ遷移エフェクト 直前ページの後片付けもこのカートリッジをトリガーにして行う
class SECtransitionsPage extends EventCartridge{
	var _currentPage : Page;
	var _nextPage : Page;
	var _next : boolean;
	var _same : boolean;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(nextPage : Page){
		this._currentPage = Page.current;
		this._nextPage = nextPage;

		if(this._currentPage != null){
			// 進行方向の確認
			var ddepth = this._nextPage.depth - this._currentPage.depth;
			if(this._currentPage.type != this._nextPage.type){ddepth = Math.floor(ddepth / 10);}
			if(ddepth > 0){this._same = false; this._next = true;}
			if(ddepth < 0){this._same = false; this._next = false;}
			if(ddepth == 0){this._same = true; this._next = true;}
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
			}else if(this._same){
				// 同階層で戻る場合も初期位置の変更
				Util.cssTranslate(this._currentPage.div, 0, 0);
				Util.cssTranslate(this._nextPage.div, -320, 0);
			}else{
				// 戻る場合は重ね順を考慮して配置しなおし
				Page.containerDiv.appendChild(this._currentPage.div);
			}
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._action++;
		// 描画
		if(this._currentPage != null){
			// ページの遷移演出
			var num = this._action / 10;
			if(this._next){
				Util.cssTranslate(this._nextPage.div, 320 * (1 - num * num), 0);
				if(this._same){Util.cssTranslate(this._currentPage.div, 320 * (0 - num * num), 0);}
			}else{
				Util.cssTranslate(this._currentPage.div, 320 * (num * num), 0);
				if(this._same){Util.cssTranslate(this._nextPage.div, 320 * (num * num - 1), 0);}
			}
		}
		return (this._action < 10);
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
	override function init() : boolean{
		// 動作重複禁止
		if(PECopenHeader._current != null){PECopenHeader._current._exist = false;}
		PECopenHeader._current = this;
		// 位置記録
		this._start = PECopenHeader._position;
		this._goal = (this._type > 0) ? 0 : PECopenHeader.hide;
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			this._action++;
			PECopenHeader._position = this._start + (this._goal - this._start) * (this._action / 10);
			// 描画
			if(this._start != this._goal){Util.cssTranslate(Page.headerDiv, 0, PECopenHeader._position);}
			if(this._action == 1){
				Page.titleDiv.innerHTML = "";
				Page.backDiv.innerHTML = "";
				Page.menuDiv.innerHTML = "";
			}else if(this._action == 10 && this._type > 0){
				Page.titleDiv.innerHTML = this._name;
				Page.backDiv.innerHTML = (this._type == 1) ? "top" : "back";
				Page.menuDiv.innerHTML = "menu";
			}
			return (this._action < 10);
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECopenHeader._current == this){PECopenHeader._current = null;}
	}
}

// 左コントローラの展開
class PECopenLctrl extends EventCartridge{
	static const hide = -144;
	static var _current : PECopenLctrl;
	static var _position = PECopenLctrl.hide;
	var _open : boolean;
	var _start : int;
	var _goal : int;
	var _action : int = 0;
	var _exist = true;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(open : boolean){
		this._open = open;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECopenLctrl._current != null){PECopenLctrl._current._exist = false;}
		PECopenLctrl._current = this;
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			if(this._action == 0){
				// 前半位置記録
				this._start = PECopenLctrl._position;
				this._goal = !this._open ? PECopenLctrl.hide : this._start;
			}else if(this._action == 8){
				// 後半位置記録
				this._start = PECopenLctrl._position;
				this._goal = this._open ? 0 : PECopenLctrl.hide;
			}
			this._action++;
			var num = (this._action <= 8) ? (this._action / 8) : ((this._action - 8) / 8);
			PECopenLctrl._position = this._start + (this._goal - this._start) * num;
			// 描画
			if(this._start != this._goal){Util.cssTranslate(Ctrl.lDiv, PECopenLctrl._position, 0);}
			return (this._action < 16);
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECopenLctrl._current == this){PECopenLctrl._current = null;}
	}
}

// 右コントローラの展開
class PECopenRctrl extends EventCartridge{
	static const hide = 144;
	static var _current : PECopenRctrl;
	static var _position = PECopenRctrl.hide;
	var _zbtn : string;
	var _xbtn : string;
	var _cbtn : string;
	var _sbtn : string;
	var _open : boolean;
	var _change : boolean;
	var _start : int;
	var _goal : int;
	var _action : int = 0;
	var _exist = true;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(zbtn : string, xbtn : string, cbtn : string, sbtn : string){
		this._zbtn = zbtn;
		this._xbtn = xbtn;
		this._cbtn = cbtn;
		this._sbtn = sbtn;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECopenRctrl._current != null){PECopenRctrl._current._exist = false;}
		PECopenRctrl._current = this;
		// 展開確認
		this._open = (this._zbtn != "") || (this._xbtn != "") || (this._cbtn != "") || (this._sbtn != "");
		this._change = false;
		this._change = this._change || (Ctrl.zbDiv.innerHTML != this._zbtn);
		this._change = this._change || (Ctrl.xbDiv.innerHTML != this._xbtn);
		this._change = this._change || (Ctrl.cbDiv.innerHTML != this._cbtn);
		this._change = this._change || (Ctrl.sbDiv.innerHTML != this._sbtn);
		if(this._change){Ctrl.rKeyLock = true;}
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			if(this._action == 0){
				// 前半位置記録
				this._start = PECopenRctrl._position;
				this._goal = (!this._open || this._change) ? PECopenRctrl.hide : this._start;
			}else if(this._action == 8){
				// 後半位置記録
				this._start = PECopenRctrl._position;
				this._goal = this._open ? 0 : PECopenRctrl.hide;
				Ctrl.rKeyLock = false;
			}
			this._action++;
			var num = (this._action <= 8) ? (this._action / 8) : ((this._action - 8) / 8);
			PECopenRctrl._position = this._start + (this._goal - this._start) * num;
			// 描画
			if(this._start != this._goal){Util.cssTranslate(Ctrl.rDiv, PECopenRctrl._position, 0);}
			if(this._action == 8 && this._change){
				Ctrl.zbDiv.innerHTML = this._zbtn;
				Ctrl.xbDiv.innerHTML = this._xbtn;
				Ctrl.cbDiv.innerHTML = this._cbtn;
				Ctrl.sbDiv.innerHTML = this._sbtn;
				Ctrl.zbDiv.style.display = (this._zbtn != "") ? "block" : "none";
				Ctrl.xbDiv.style.display = (this._xbtn != "") ? "block" : "none";
				Ctrl.cbDiv.style.display = (this._cbtn != "") ? "block" : "none";
				Ctrl.sbDiv.style.display = (this._sbtn != "") ? "block" : "none";
			}
			return (this._action < 16);
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECopenRctrl._current == this){PECopenRctrl._current = null;}
	}
}

// キャラクターの展開
class PECopenCharacter extends EventCartridge{
	static const hide = -160;
	static var _current : PECopenCharacter;
	static var _position = PECopenCharacter.hide;
	static var _code : string;
	static var _div : HTMLDivElement;
	var _code : string;
	var _type : string;
	var _open : boolean;
	var _change : boolean;
	var _start : int;
	var _goal : int;
	var _action : int = 0;
	var _exist = true;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(code : string, type : string){
		this._code = code;
		this._type = type;
		if(PECopenCharacter._div == null){
			PECopenCharacter._div = dom.document.getElementById("character") as HTMLDivElement;
			Util.cssTranslate(PECopenCharacter._div, PECopenCharacter.hide, 0);
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 動作重複禁止
		if(PECopenCharacter._current != null){PECopenCharacter._current._exist = false;}
		PECopenCharacter._current = this;
		// 展開確認
		this._open = (this._code != "");
		this._change = (PECopenCharacter._code != this._code);
		return true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{		
		if(this._exist){
			if(this._action == 0){
				// 前半位置記録
				this._start = PECopenCharacter._position;
				this._goal = (!this._open || this._change) ? PECopenCharacter.hide : this._start;
			}else if(this._action == 8){
				// 後半位置記録
				this._start = PECopenCharacter._position;
				this._goal = this._open ? 0 : PECopenCharacter.hide;
			}
			this._action++;
			var num = (this._action <= 8) ? (this._action / 8) : ((this._action - 8) / 8);
			PECopenCharacter._position = this._start + (this._goal - this._start) * num;
			// 描画
			if(this._start != this._goal){Util.cssTranslate(PECopenCharacter._div, PECopenCharacter._position, 0);}
			if(this._action == 8){
				PECopenCharacter._code = this._code;
				var type = "b64_bust_";
				if(this._type == "damage"){type = "b64_damage_";}
				PECopenCharacter._div.style.backgroundImage = (this._code == "") ? "none" : ("url(" + Loader.b64imgs[type + this._code] + ")");
			}
			return (this._action < 16);
		}else{return false;}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(PECopenCharacter._current == this){PECopenCharacter._current = null;}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

