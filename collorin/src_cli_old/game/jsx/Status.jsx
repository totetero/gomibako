import 'js/web.jsx';

import 'Ctrl.jsx';
import 'EventCartridge.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス表示クラス
class Status{
	static var _btn : ECstatButton;
	static var _msg : ECstatMessage;
	static var _gau : ECstatGauge;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		EventCartridge.parallelPush(Status._btn = new ECstatButton());
		EventCartridge.parallelPush(Status._msg = new ECstatMessage());
		EventCartridge.parallelPush(Status._gau = new ECstatGauge());
	}

	// ----------------------------------------------------------------
	// ボタンの設定と入れ替えモーション開始
	static function setBtn(arrow : int, btnz : string, btnx : string, btnc : string, btns : string) : void{
		// 十字キー設定
		if(Status._btn._showArrow != arrow){
			Cbtn.showArrow = (arrow > 0);
			Status._btn._showArrow = arrow;
			Status._btn._actionArrow = (Status._btn._actionArrow == 0) ? 1 : Math.abs(Status._btn._actionArrow);
		}

		// ボタン設定
		if(Status._btn._strButtonz != btnz || Status._btn._strButtonx != btnx || Status._btn._strButtonc != btnc || Status._btn._strButtons != btns){
			Cbtn.showButton = (btnz != "") || (btnx != "") || (btnc != "") || (btns != "");
			Status._btn._actionButton = (Status._btn._actionButton == 0) ? 1 : Math.abs(Status._btn._actionButton);
			Status._btn._strButtonz = btnz;
			Status._btn._strButtonx = btnx;
			Status._btn._strButtonc = btnc;
			Status._btn._strButtons = btns;
		}
	}

	// ----------------------------------------------------------------
	// キャラクター画像設定
	static function setChara(url : string) : void{
		Status._btn._characterDiv.style.backgroundImage = "url(" + url + ")";
	}

	// ----------------------------------------------------------------
	// 表示文字列指定
	static function setMsg(str : string) : void{
		//Status._msg._action = (Status._msg._action == 0) ? 1 : Math.abs(Status._msg._action);
		//Status._msg._str = str;

		// test
		if(Status._msg._str == "" || str == ""){
			Status._msg._action = 1;
		}else{
			Status._msg._div.innerHTML = str;
		}
		Status._msg._str = str;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス ボタン表示クラス
class ECstatButton extends EventCartridge{
	// ゲーム画面用DOM
	var _arrowDiv : HTMLDivElement;
	var _buttonDiv : HTMLDivElement;
	var _characterDiv : HTMLDivElement;
	var _upDiv : HTMLDivElement;
	var _dnDiv : HTMLDivElement;
	var _rtDiv : HTMLDivElement;
	var _ltDiv : HTMLDivElement;
	var _zbDiv : HTMLDivElement;
	var _xbDiv : HTMLDivElement;
	var _cbDiv : HTMLDivElement;
	var _sbDiv : HTMLDivElement;
	// キー状態
	var _kup : boolean;
	var _kdn : boolean;
	var _krt : boolean;
	var _klt : boolean;
	var _k_z : boolean;
	var _k_x : boolean;
	var _k_c : boolean;
	var _k_s : boolean;
	// アニメーション
	var _actionMax : int = 8;
	var _actionArrow : int = 0;
	var _actionButton : int = 0;
	var _showArrow : int;
	var _strButtonz : string;
	var _strButtonx : string;
	var _strButtonc : string;
	var _strButtons : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// DOM獲得
		this._arrowDiv = dom.document.getElementsByClassName("jsx_ecstatbutton arrow").item(0) as HTMLDivElement;
		this._buttonDiv = dom.document.getElementsByClassName("jsx_ecstatbutton button").item(0) as HTMLDivElement;
		this._characterDiv = dom.document.getElementsByClassName("jsx_ecstatbutton character").item(0) as HTMLDivElement;
		this._upDiv = this._arrowDiv.getElementsByClassName("up").item(0) as HTMLDivElement;
		this._dnDiv = this._arrowDiv.getElementsByClassName("dn").item(0) as HTMLDivElement;
		this._rtDiv = this._arrowDiv.getElementsByClassName("rt").item(0) as HTMLDivElement;
		this._ltDiv = this._arrowDiv.getElementsByClassName("lt").item(0) as HTMLDivElement;
		this._zbDiv = this._buttonDiv.getElementsByClassName("zb").item(0) as HTMLDivElement;
		this._xbDiv = this._buttonDiv.getElementsByClassName("xb").item(0) as HTMLDivElement;
		this._cbDiv = this._buttonDiv.getElementsByClassName("cb").item(0) as HTMLDivElement;
		this._sbDiv = this._buttonDiv.getElementsByClassName("sb").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// 十字キー入れ替えモーション
		if(this._actionArrow != 0){
			if(this._actionArrow++ > this._actionMax){
				this._actionArrow = -this._actionMax;
			}
		}

		// ボタン入れ替えモーション
		if(this._actionButton != 0){
			if(this._actionButton++ > this._actionMax){
				this._actionButton = -this._actionMax;
			}
		}

		// ボタン押下可否
		Cbtn.enableButton = (this._actionButton <= 0);

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// キー状態描画
		if(this._kup != Cbtn.kup){this._kup = Cbtn.kup; this._upDiv.className = Cbtn.kup ? "up hover" : "up";}
		if(this._kdn != Cbtn.kdn){this._kdn = Cbtn.kdn; this._dnDiv.className = Cbtn.kdn ? "dn hover" : "dn";}
		if(this._krt != Cbtn.krt){this._krt = Cbtn.krt; this._rtDiv.className = Cbtn.krt ? "rt hover" : "rt";}
		if(this._klt != Cbtn.klt){this._klt = Cbtn.klt; this._ltDiv.className = Cbtn.klt ? "lt hover" : "lt";}
		if(this._k_z != Cbtn.k_z){this._k_z = Cbtn.k_z; this._zbDiv.className = Cbtn.k_z ? "zb hover" : "zb";}
		if(this._k_x != Cbtn.k_x){this._k_x = Cbtn.k_x; this._xbDiv.className = Cbtn.k_x ? "xb hover" : "xb";}
		if(this._k_c != Cbtn.k_c){this._k_c = Cbtn.k_c; this._cbDiv.className = Cbtn.k_c ? "cb hover" : "cb";}
		if(this._k_s != Cbtn.k_s){this._k_s = Cbtn.k_s; this._sbDiv.className = Cbtn.k_s ? "sb hover" : "sb";}

		// 十字キー入れ替えモーション
		if(this._actionArrow + this._actionMax == 0){
			this._arrowDiv.style.display = (this._showArrow > 0) ? "block" : "none";
			this._characterDiv.style.display = (this._showArrow < 0) ? "block" : "none";
		}else{
			var num = Math.abs(this._actionArrow) / this._actionMax;
			this._arrowDiv.style.left = (-144 * num * num) + "px";
			this._characterDiv.style.left = (-144 * num * num) + "px";
		}

		// ボタン入れ替えモーション
		if(this._actionButton + this._actionMax == 0){
			this._zbDiv.style.display = (this._strButtonz != "") ? "block" : "none";
			this._xbDiv.style.display = (this._strButtonx != "") ? "block" : "none";
			this._cbDiv.style.display = (this._strButtonc != "") ? "block" : "none";
			this._sbDiv.style.display = (this._strButtons != "") ? "block" : "none";
			this._zbDiv.innerHTML = this._strButtonz;
			this._xbDiv.innerHTML = this._strButtonx;
			this._cbDiv.innerHTML = this._strButtonc;
			this._sbDiv.innerHTML = this._strButtons;
		}else{
			var num = Math.abs(this._actionButton) / this._actionMax;
			this._buttonDiv.style.right = (-144 * num * num) + "px";
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス メッセージ表示クラス
class ECstatMessage extends EventCartridge{
	var _div : HTMLDivElement;
	var _actionMax : int = 8;
	var _action : int = 0;
	var _str : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// DOM獲得
		this._div = dom.document.getElementsByClassName("jsx_ecstatmessage message").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// 入れ替えモーション
		if(this._action != 0){
			if(this._action++ > this._actionMax){
				this._action = -this._actionMax;
			}
		}
		
		// actionShow & actionHide ?

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ボタン入れ替えモーション
		if(this._action + this._actionMax == 0){
			this._div.style.display = (this._str != "") ? "block" : "none";
			this._div.innerHTML = this._str;
		}else{
			var num = Math.abs(this._action) / this._actionMax;
			this._div.style.right = (12 - 144 * num * num) + "px";
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス ゲージ表示クラス
class ECstatGauge extends EventCartridge{
	var div : HTMLDivElement;
	var hdiv0 : HTMLDivElement;
	var hdiv1 : HTMLDivElement;
	var hdiv2 : HTMLDivElement;
	var sdiv0 : HTMLDivElement;
	var sdiv1 : HTMLDivElement;
	var sdiv2 : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// DOM獲得
		this.div = dom.document.getElementsByClassName("jsx_ecstatgauge status").item(0) as HTMLDivElement;
		var hdiv = this.div.getElementsByClassName("hp").item(0) as HTMLDivElement;
		var sdiv = this.div.getElementsByClassName("sp").item(0) as HTMLDivElement;
		this.hdiv0 = hdiv.getElementsByClassName("wrap").item(0) as HTMLDivElement;
		this.hdiv1 = hdiv.getElementsByClassName("param").item(1) as HTMLDivElement;
		this.hdiv2 = hdiv.getElementsByClassName("param").item(0) as HTMLDivElement;
		this.sdiv0 = sdiv.getElementsByClassName("wrap").item(0) as HTMLDivElement;
		this.sdiv1 = sdiv.getElementsByClassName("param").item(1) as HTMLDivElement;
		this.sdiv2 = sdiv.getElementsByClassName("param").item(0) as HTMLDivElement;

		// test
		this.hdiv0.innerHTML = "30/100";
		this.sdiv0.innerHTML = "80/100";
		this.hdiv1.style.width = "30px";
		this.hdiv2.style.width = "40px";
		this.sdiv1.style.width = "80px";
		this.sdiv2.style.width = "90px";
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

