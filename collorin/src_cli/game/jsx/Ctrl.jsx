import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 操作用クラス
class Ctrl{
	// ゲーム画面用DOM
	static var div : HTMLDivElement;
	// マウス状態
	static var isTouch : boolean;
	static var mdn : boolean;
	static var mmv : boolean;
	static var mx : int = 0;
	static var my : int = 0;
	// ウインドウ状態
	static var ww : int = 0;
	static var wh : int = 0;

	// 内部演算用 タッチ状態
	static var _mode : int = 0;
	static var _tempmx : int;
	static var _tempmy : int;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Ctrl.div = dom.document.getElementById("root") as HTMLDivElement;

		// リスナー追加
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			Ctrl.div.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.div.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.div.addEventListener("touchend", Ctrl.mupfn, true);
			Ctrl.div.addEventListener("touchcancel", Ctrl.mupfn, true);
		}else{
			Ctrl.div.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.div.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.div.addEventListener("mouseup", Ctrl.mupfn, true);
			Ctrl.div.addEventListener("mouseout", function(e : Event){
				var me : MouseEvent = e as MouseEvent;
				if(Ctrl.mdn && me.target == Ctrl.div && (me.clientX <= 0 || Ctrl.ww <= me.clientX || me.clientY <= 0 || Ctrl.wh <= me.clientY)){
					Ctrl.mupfn(e);
				}
			}, true);
			dom.document.addEventListener("keydown", Cbtn.kdnfn, true);
			dom.document.addEventListener("keyup", Cbtn.kupfn, true);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズの変更確認
		var w = dom.window.innerWidth;
		var h = dom.window.innerHeight;
		if(Ctrl.ww != w || Ctrl.wh != h){
			Ctrl.ww = w;
			Ctrl.wh = h;
		}
	}

	// ----------------------------------------------------------------
	// マウス座標確認
	static function getmmv(e : Event) : void {
		// 座標を獲得する
		if(Ctrl.isTouch){
			var te : TouchEvent = e as TouchEvent;
			Ctrl.mx = te.changedTouches[0].clientX;
			Ctrl.my = te.changedTouches[0].clientY;
		}else{
			var me : MouseEvent = e as MouseEvent;
			Ctrl.mx = me.clientX;
			Ctrl.my = me.clientY;
		}
	}

	// ----------------------------------------------------------------
	// マウスを押す
	static function mdnfn(e : Event) : void{
		// イベント処理
		Ctrl.getmmv(e);
		if(Cbtn.btnchk()){
			// ボタン押下開始
			Cbtn.btnfn(false);
			Ctrl._mode = 1;
		}else{
			// 画面押下開始
			Ctrl.mdn = true;
			Ctrl.mmv = false;
			Ctrl._mode = 2;
			Ctrl._tempmx = Ctrl.mx;
			Ctrl._tempmy = Ctrl.my;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void{
		// イベント処理
		Ctrl.getmmv(e);
		if(Ctrl._mode > 0){
			if(Ctrl._mode == 1){
				// ボタン押下処理
				Cbtn.btnfn(false);
			}else if(Ctrl._mode == 2){
				// 画面押下処理
				if(!Ctrl.mmv){
					// 移動状態移行確認
					var x = Ctrl._tempmx - Ctrl.mx;
					var y = Ctrl._tempmy - Ctrl.my;
					Ctrl.mmv = (x * x + y * y > 10);
				}
			}
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウスを離す
	static function mupfn(e : Event) : void{
		// イベント処理
		Ctrl.getmmv(e);
		if(Ctrl._mode > 0){
			if(Ctrl._mode == 1){
				// ボタン押下終了
				Cbtn.btnfn(true);
			}else if(Ctrl._mode == 2){
				// 画面押下終了
				Ctrl.mdn = false;
			}
			Ctrl._mode = 0;
		}
		// 上位ノードイベントキャンセル
		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ボタン用クラス
class Cbtn{
	// キー状態
	static var kup : boolean;
	static var kdn : boolean;
	static var krt : boolean;
	static var klt : boolean;
	static var k_z : boolean;
	static var k_x : boolean;
	static var k_c : boolean;
	static var k_s : boolean;
	static var trigger_z : boolean;
	static var trigger_x : boolean;
	static var trigger_c : boolean;
	static var trigger_s : boolean;

	// 内部演算用 ゲーム画面用DOM
	static var _arrowDiv : HTMLDivElement;
	static var _buttonDiv : HTMLDivElement;
	static var _characterDiv : HTMLDivElement;
	static var _upDiv : HTMLDivElement;
	static var _dnDiv : HTMLDivElement;
	static var _rtDiv : HTMLDivElement;
	static var _ltDiv : HTMLDivElement;
	static var _zbDiv : HTMLDivElement;
	static var _xbDiv : HTMLDivElement;
	static var _cbDiv : HTMLDivElement;
	static var _sbDiv : HTMLDivElement;
	// 内部演算用 キー状態
	static var _bkup : boolean = false;
	static var _bkdn : boolean = false;
	static var _bkrt : boolean = false;
	static var _bklt : boolean = false;
	static var _bk_z : boolean = false;
	static var _bk_x : boolean = false;
	static var _bk_c : boolean = false;
	static var _bk_s : boolean = false;
	static var _kkup : boolean = false;
	static var _kkdn : boolean = false;
	static var _kkrt : boolean = false;
	static var _kklt : boolean = false;
	static var _kk_z : boolean = false;
	static var _kk_x : boolean = false;
	static var _kk_c : boolean = false;
	static var _kk_s : boolean = false;
	// 内部演算用 アニメーション
	static var _actionMax : int = 8;
	static var _actionArrow : int = 0;
	static var _actionButton : int = 0;
	static var _showArrow : int;
	static var _showButton : boolean;
	static var _strButtonz : string;
	static var _strButtonx : string;
	static var _strButtonc : string;
	static var _strButtons : string;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Cbtn._arrowDiv = dom.document.getElementsByClassName("jsx_cbtn arrow").item(0) as HTMLDivElement;
		Cbtn._buttonDiv = dom.document.getElementsByClassName("jsx_cbtn button").item(0) as HTMLDivElement;
		Cbtn._characterDiv = dom.document.getElementsByClassName("jsx_cbtn character").item(0) as HTMLDivElement;
		Cbtn._upDiv = Cbtn._arrowDiv.getElementsByClassName("up").item(0) as HTMLDivElement;
		Cbtn._dnDiv = Cbtn._arrowDiv.getElementsByClassName("dn").item(0) as HTMLDivElement;
		Cbtn._rtDiv = Cbtn._arrowDiv.getElementsByClassName("rt").item(0) as HTMLDivElement;
		Cbtn._ltDiv = Cbtn._arrowDiv.getElementsByClassName("lt").item(0) as HTMLDivElement;
		Cbtn._zbDiv = Cbtn._buttonDiv.getElementsByClassName("zb").item(0) as HTMLDivElement;
		Cbtn._xbDiv = Cbtn._buttonDiv.getElementsByClassName("xb").item(0) as HTMLDivElement;
		Cbtn._cbDiv = Cbtn._buttonDiv.getElementsByClassName("cb").item(0) as HTMLDivElement;
		Cbtn._sbDiv = Cbtn._buttonDiv.getElementsByClassName("sb").item(0) as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// 十字キー入れ替えモーション
		if(Cbtn._actionArrow != 0){
			if(Cbtn._actionArrow++ > Cbtn._actionMax){
				Cbtn._actionArrow = -Cbtn._actionMax;
			}
		}
		// ボタン入れ替えモーション
		if(Cbtn._actionButton != 0){
			if(Cbtn._actionButton++ > Cbtn._actionMax){
				Cbtn._actionButton = -Cbtn._actionMax;
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// キー状態確認
		var kup = Cbtn._bkup || Cbtn._kkup;
		var kdn = Cbtn._bkdn || Cbtn._kkdn;
		var krt = Cbtn._bkrt || Cbtn._kkrt;
		var klt = Cbtn._bklt || Cbtn._kklt;
		var k_z = Cbtn._bk_z || Cbtn._kk_z;
		var k_x = Cbtn._bk_x || Cbtn._kk_x;
		var k_c = Cbtn._bk_c || Cbtn._kk_c;
		var k_s = Cbtn._bk_s || Cbtn._kk_s;
		// キー状態描画
		if(Cbtn.kup != kup){Cbtn.kup = kup; Cbtn._upDiv.className = Cbtn.kup ? "up hover" : "up";}
		if(Cbtn.kdn != kdn){Cbtn.kdn = kdn; Cbtn._dnDiv.className = Cbtn.kdn ? "dn hover" : "dn";}
		if(Cbtn.krt != krt){Cbtn.krt = krt; Cbtn._rtDiv.className = Cbtn.krt ? "rt hover" : "rt";}
		if(Cbtn.klt != klt){Cbtn.klt = klt; Cbtn._ltDiv.className = Cbtn.klt ? "lt hover" : "lt";}
		if(Cbtn.k_z != k_z){Cbtn.k_z = k_z; Cbtn._zbDiv.className = Cbtn.k_z ? "zb hover" : "zb";}
		if(Cbtn.k_x != k_x){Cbtn.k_x = k_x; Cbtn._xbDiv.className = Cbtn.k_x ? "xb hover" : "xb";}
		if(Cbtn.k_c != k_c){Cbtn.k_c = k_c; Cbtn._cbDiv.className = Cbtn.k_c ? "cb hover" : "cb";}
		if(Cbtn.k_s != k_s){Cbtn.k_s = k_s; Cbtn._sbDiv.className = Cbtn.k_s ? "sb hover" : "sb";}
		// 十字キー入れ替えモーション
		if(Cbtn._actionArrow + Cbtn._actionMax == 0){
			Cbtn._arrowDiv.style.display = (Cbtn._showArrow > 0) ? "block" : "none";
			Cbtn._characterDiv.style.display = (Cbtn._showArrow < 0) ? "block" : "none";
		}else{
			var num = Math.abs(Cbtn._actionArrow) / Cbtn._actionMax;
			Cbtn._arrowDiv.style.left = (-144 * num * num) + "px";
			Cbtn._characterDiv.style.left = (-144 * num * num) + "px";
		}
		// ボタン入れ替えモーション
		if(Cbtn._actionButton + Cbtn._actionMax == 0){
			Cbtn._zbDiv.style.display = (Cbtn._strButtonz != "") ? "block" : "none";
			Cbtn._xbDiv.style.display = (Cbtn._strButtonx != "") ? "block" : "none";
			Cbtn._cbDiv.style.display = (Cbtn._strButtonc != "") ? "block" : "none";
			Cbtn._sbDiv.style.display = (Cbtn._strButtons != "") ? "block" : "none";
			Cbtn._zbDiv.innerHTML = Cbtn._strButtonz;
			Cbtn._xbDiv.innerHTML = Cbtn._strButtonx;
			Cbtn._cbDiv.innerHTML = Cbtn._strButtonc;
			Cbtn._sbDiv.innerHTML = Cbtn._strButtons;
		}else{
			var num = Math.abs(Cbtn._actionButton) / Cbtn._actionMax;
			Cbtn._buttonDiv.style.right = (-144 * num * num) + "px";
		}
	}

	// ----------------------------------------------------------------
	// キーを押す
	static function kdnfn(e : Event) : void{
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Cbtn._kklt = true; break;
			case 38: Cbtn._kkup = true; break;
			case 39: Cbtn._kkrt = true; break;
			case 40: Cbtn._kkdn = true; break;
			case 88: if(Cbtn._actionButton <= 0){Cbtn._kk_x = true;} break;
			case 90: if(Cbtn._actionButton <= 0){Cbtn._kk_z = true;} break;
			case 67: if(Cbtn._actionButton <= 0){Cbtn._kk_c = true;} break;
			case 32: if(Cbtn._actionButton <= 0){Cbtn._kk_s = true;} break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function kupfn(e : Event) : void{
		var getkey = true;
		var ke = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Cbtn._kklt = false; break;
			case 38: Cbtn._kkup = false; break;
			case 39: Cbtn._kkrt = false; break;
			case 40: Cbtn._kkdn = false; break;
			case 88: Cbtn._kk_x = false; if(Cbtn._actionButton <= 0){Cbtn.trigger_x = true;} break;
			case 90: Cbtn._kk_z = false; if(Cbtn._actionButton <= 0){Cbtn.trigger_z = true;} break;
			case 67: Cbtn._kk_c = false; if(Cbtn._actionButton <= 0){Cbtn.trigger_c = true;} break;
			case 32: Cbtn._kk_s = false; if(Cbtn._actionButton <= 0){Cbtn.trigger_s = true;} break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}

	// ----------------------------------------------------------------
	// ボタン押下範囲の確認
	static function btnchk() : boolean{
		var flag = false;
		// 左の十字キーエリア確認
		flag = flag || (Cbtn._showArrow > 0 && 0 < Ctrl.mx && Ctrl.mx < 144 && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
		// 右のボタンエリア確認
		flag = flag || (Cbtn._showButton && Ctrl.ww - 144 < Ctrl.mx && Ctrl.mx < Ctrl.ww && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
		return flag;
	}

	// ----------------------------------------------------------------
	// ボタンを押す
	static function btnfn(trigger : boolean) : void{
		// 押下状態リセット
		Cbtn._bkup = Cbtn._bkdn = Cbtn._bkrt = Cbtn._bklt = false;
		Cbtn._bk_z = Cbtn._bk_x = Cbtn._bk_c = Cbtn._bk_s = false;

		// 十字キー確認
		if(!trigger){
			var x = Ctrl.mx - 72;
			var y = Ctrl.my - Ctrl.wh + 72;
			if(x * x + y * y < 72 * 72){
				if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){Cbtn._bkup = true;}
				if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){Cbtn._bkdn = true;}
				if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){Cbtn._bkrt = true;}
				if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){Cbtn._bklt = true;}
			}
		}

		// ボタン確認
		var x = Ctrl.mx - Ctrl.ww + 144;
		if(12 < x && x < 132 && Cbtn._actionButton <= 0){
			var y = Ctrl.my - Ctrl.wh + 144;
			if(  0 < y && y <  36){if(trigger){Cbtn.trigger_z = true;}else{Cbtn._bk_z = true;}}
			if( 36 < y && y <  72){if(trigger){Cbtn.trigger_x = true;}else{Cbtn._bk_x = true;}}
			if( 72 < y && y < 108){if(trigger){Cbtn.trigger_c = true;}else{Cbtn._bk_c = true;}}
			if(108 < y && y < 144){if(trigger){Cbtn.trigger_s = true;}else{Cbtn._bk_s = true;}}
		}
	}

	// ----------------------------------------------------------------
	// ボタンの設定と入れ替えモーション開始
	static function setBtn(arrow : int, btnz : string, btnx : string, btnc : string, btns : string) : void{
		// 十字キー設定
		if(Cbtn._showArrow != arrow){
			Cbtn._actionArrow = (Cbtn._actionArrow == 0) ? 1 : Math.abs(Cbtn._actionArrow);
			Cbtn._showArrow = arrow;
		}

		// ボタン設定
		if(Cbtn._strButtonz != btnz || Cbtn._strButtonx != btnx || Cbtn._strButtonc != btnc || Cbtn._strButtons != btns){
			Cbtn._showButton = (btnz != "") || (btnx != "") || (btnc != "") || (btns != "");
			Cbtn._actionButton = (Cbtn._actionButton == 0) ? 1 : Math.abs(Cbtn._actionButton);
			Cbtn._strButtonz = btnz;
			Cbtn._strButtonx = btnx;
			Cbtn._strButtonc = btnc;
			Cbtn._strButtons = btns;
		}
	}

	// ----------------------------------------------------------------
	// キャラクター画像設定
	static function setChara(url : string) : void{
		Cbtn._characterDiv.style.backgroundImage = "url(" + url + ")";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// キャンバス操作クラス

class Ccvs{
	// ゲーム画面用DOM
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// マウス状態 キャンバスとの相対位置
	static var mdn : boolean;
	static var mx : int;
	static var my : int;
	// ゲーム画面キャンバス カメラ位置
	static var cx0 : number = 0;
	static var cy0 : number = 0;
	static var cx1 : number = 0;
	static var cy1 : number = 0;
	static var cxmax : number = 0;
	static var cymax : number = 0;
	static var cxmin : number = 0;
	static var cymin : number = 0;
	// ゲーム画面キャンバス 画面拡大回転
	static var scale : number;
	static var rotv : number;
	static var roth : number;
	static var sinv : number;
	static var cosv : number;
	static var sinh : number;
	static var cosh : number;
	// モード (0:舞台回転 1:マップ移動)
	static var mode = 0;

	// 内部演算用 マウス移動量差分を求める変数
	static var _tempmdn : boolean;
	static var _tempmx : int = 0;
	static var _tempmy : int = 0;
	// 内部演算用 垂直回転角度
	static var _rotv : number;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Ccvs.canvas = dom.document.getElementsByClassName("jsx_ccvs main").item(0) as HTMLCanvasElement;
		Ccvs.context = Ccvs.canvas.getContext("2d") as CanvasRenderingContext2D;

		Ccvs.scale = 1;
		Ccvs.rotv = Math.PI / 180 * 0;
		Ccvs.roth = Math.PI / 180 * 45;
		Ccvs.sinv = Math.sin(Ccvs.rotv);
		Ccvs.cosv = Math.cos(Ccvs.rotv);
		Ccvs.sinh = Math.sin(Ccvs.roth);
		Ccvs.cosh = Math.cos(Ccvs.roth);
		Ccvs._rotv = Ccvs.rotv;
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		Ccvs.mx = Ctrl.mx - (Ctrl.ww - Ccvs.canvas.width) * 0.5;
		Ccvs.my = Ctrl.my - (Ctrl.wh - Ccvs.canvas.height) * 0.5;

		// キャンバス内でクリック開始したかの確認
		if(Ccvs._tempmdn != Ctrl.mdn){
			Ccvs._tempmdn = Ctrl.mdn;
			Ccvs.mdn = (Ccvs._tempmdn && 0 < Ccvs.mx && Ccvs.mx < Ccvs.canvas.width && 0 < Ccvs.my && Ccvs.my < Ccvs.canvas.height);
		}

		if(Ccvs.mdn && Ctrl.mmv){
			// マウス移動中
			if(Ccvs.mode == 0){
				// 舞台回転処理
				var x0 = Ccvs._tempmx - Ccvs.canvas.width * 0.5;
				var y0 = Ccvs._tempmy - Ccvs.canvas.height * 0.5;
				var r0 = Math.sqrt(x0 * x0 + y0 * y0);
				var x1 = Ccvs.mx - Ccvs.canvas.width * 0.5;
				var y1 = Ccvs.my - Ccvs.canvas.height * 0.5;
				var r1 = Math.sqrt(x1 * x1 + y1 * y1);
				if(r0 > 20 && r1 > 20){
					var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
					if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
					Ccvs.rotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
					// 垂直角度処理
					Ccvs._rotv = Ccvs.rotv;
					Ccvs.sinv = Math.sin(Ccvs.rotv);
					Ccvs.cosv = Math.cos(Ccvs.rotv);
				}
			}else if(Ccvs.mode == 1){
				// マップ移動 地図の水平移動
				var x = Ccvs._tempmx - Ccvs.mx;
				var y = Ccvs._tempmy - Ccvs.my;
				Ccvs.cx0 += (x *  Ccvs.cosv + y * Ccvs.sinv) / Ccvs.scale;
				Ccvs.cy0 += (x * -Ccvs.sinv + y * Ccvs.cosv) / Ccvs.scale;
				if(Ccvs.cx0 > Ccvs.cxmax){Ccvs.cx0 = Ccvs.cxmax;}else if(Ccvs.cx0 < Ccvs.cxmin){Ccvs.cx0 = Ccvs.cxmin;}
				if(Ccvs.cy0 > Ccvs.cymax){Ccvs.cy0 = Ccvs.cymax;}else if(Ccvs.cy0 < Ccvs.cymin){Ccvs.cy0 = Ccvs.cymin;}
			}
		}
		Ccvs._tempmx = Ccvs.mx;
		Ccvs._tempmy = Ccvs.my;

		if(Ccvs.mode == 1){
			// モード変更時に垂直回転を最低限にするための処理
			while(Ccvs.rotv < -Math.PI){Ccvs.rotv += Math.PI * 2;}
			while(Ccvs.rotv > Math.PI){Ccvs.rotv -= Math.PI * 2;}
			while(Ccvs._rotv < -Math.PI){Ccvs._rotv += Math.PI * 2;}
			while(Ccvs._rotv > Math.PI){Ccvs._rotv -= Math.PI * 2;}
		}else{
			// 中心をプレイヤー位置に寄せる
			Ccvs.cx0 += (Ccvs.cx1 - Ccvs.cx0) * 0.3;
			Ccvs.cy0 += (Ccvs.cy1 - Ccvs.cy0) * 0.3;
		}

		// 垂直角度
		var drv = Ccvs.rotv - ((Ccvs.mode == 1) ? 0 : Ccvs._rotv);
		if(Math.abs(drv) > 0.01){
			Ccvs.rotv -= drv * 0.1;
			Ccvs.sinv = Math.sin(Ccvs.rotv);
			Ccvs.cosv = Math.cos(Ccvs.rotv);
		}
		// 水平角度
		var drh = Ccvs.roth - Math.PI / 180 * ((Ccvs.mode == 1) ? 90 : 30);
		if(Math.abs(drh) > 0.01){
			Ccvs.roth -= drh * 0.1;
			Ccvs.sinh = Math.sin(Ccvs.roth);
			Ccvs.cosh = Math.cos(Ccvs.roth);
		}
		// 拡大縮小
		var scale = (Ccvs.mode == 1) ? 0.8 : 2.5;
		Ccvs.scale += (scale - Ccvs.scale) * 0.1;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

