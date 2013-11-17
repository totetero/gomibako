import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 操作用クラス
class Ctrl{
	// マウス状態
	static var isTouch : boolean;
	static var mdn : boolean;
	static var mmv : boolean;
	static var mx : int = 0;
	static var my : int = 0;
	// ゲーム画面用DOM
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// ウインドウ状態
	static var wl : int;
	static var wt : int;
	static var ww : int = 0;
	static var wh : int = 0;

	// 内部演算用 タッチ状態
	static var _mode : int = 0;
	static var _tempmx : int;
	static var _tempmy : int;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// ゲーム画面canvasの準備
		Ctrl.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.className = "main";
		Ctrl.canvas.width = 320;
		Ctrl.canvas.height = 320;
		// root divの準備
		Ctrl.div = dom.document.createElement("div") as HTMLDivElement;
		Ctrl.div.className = "root";
		Ctrl.div.appendChild(Ctrl.canvas);
		dom.document.body.appendChild(Ctrl.div);

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
			Ctrl.canvas.style.left = (Ctrl.wl = (w - Ctrl.canvas.width) * 0.5) + "px";
			Ctrl.canvas.style.top = (Ctrl.wt = (h - Ctrl.canvas.height) * 0.5) + "px";
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
		if(Ctrl._mode > 0){
			Ctrl.getmmv(e);
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
		if(Ctrl._mode > 0){
			Ctrl.getmmv(e);
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

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM作成
		Cbtn._arrowDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._buttonDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._upDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._dnDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._rtDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._ltDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._zbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._xbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._cbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._sbDiv = dom.document.createElement("div") as HTMLDivElement;
		Cbtn._arrowDiv.className = "arrow";
		Cbtn._buttonDiv.className = "button";
		Cbtn._upDiv.className = "up";
		Cbtn._dnDiv.className = "dn";
		Cbtn._rtDiv.className = "rt";
		Cbtn._ltDiv.className = "lt";
		Cbtn._zbDiv.className = "zb";
		Cbtn._xbDiv.className = "xb";
		Cbtn._cbDiv.className = "cb";
		Cbtn._sbDiv.className = "sb";
		Cbtn._arrowDiv.appendChild(Cbtn._upDiv);
		Cbtn._arrowDiv.appendChild(Cbtn._dnDiv);
		Cbtn._arrowDiv.appendChild(Cbtn._rtDiv);
		Cbtn._arrowDiv.appendChild(Cbtn._ltDiv);
		Cbtn._buttonDiv.appendChild(Cbtn._zbDiv);
		Cbtn._buttonDiv.appendChild(Cbtn._xbDiv);
		Cbtn._buttonDiv.appendChild(Cbtn._cbDiv);
		Cbtn._buttonDiv.appendChild(Cbtn._sbDiv);
		Ctrl.div.appendChild(Cbtn._arrowDiv);
		Ctrl.div.appendChild(Cbtn._buttonDiv);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// 動き系の計算を入れる
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
			case 88: Cbtn._kk_x = true; break;
			case 90: Cbtn._kk_z = true; break;
			case 67: Cbtn._kk_c = true; break;
			case 32: Cbtn._kk_s = true; break;
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
			case 88: Cbtn._kk_x = false; Cbtn.trigger_x = true; break;
			case 90: Cbtn._kk_z = false; Cbtn.trigger_z = true; break;
			case 67: Cbtn._kk_c = false; Cbtn.trigger_c = true; break;
			case 32: Cbtn._kk_s = false; Cbtn.trigger_s = true; break;
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
		flag = flag || (0 < Ctrl.mx && Ctrl.mx < 144 && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
		// 右のボタンエリア確認
		flag = flag || (Ctrl.ww - 144 < Ctrl.mx && Ctrl.mx < Ctrl.ww && Ctrl.wh - 144 < Ctrl.my && Ctrl.my < Ctrl.wh);
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
		if(12 < x && x < 132){
			var y = Ctrl.my - Ctrl.wh + 144;
			if(  0 < y && y <  36){if(trigger){Cbtn.trigger_z = true;}else{Cbtn._bk_z = true;}}
			if( 36 < y && y <  72){if(trigger){Cbtn.trigger_x = true;}else{Cbtn._bk_x = true;}}
			if( 72 < y && y < 108){if(trigger){Cbtn.trigger_c = true;}else{Cbtn._bk_c = true;}}
			if(108 < y && y < 144){if(trigger){Cbtn.trigger_s = true;}else{Cbtn._bk_s = true;}}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// キャンバス操作クラス

class Ccvs{
	// マウス状態 キャンバスとの相対位置
	static var mdn : boolean;
	static var mx : int;
	static var my : int;
	// ゲーム画面キャンバス フィールド位置
	static var fx : number = 0;
	static var fy : number = 0;
	// ゲーム画面キャンバス プレイヤー位置
	static var px : number = 0;
	static var py : number = 0;
	// ゲーム画面キャンバス 画面拡大
	static var scale : number;
	// ゲーム画面キャンバス 画面回転
	static var rotv : number;
	static var roth : number;
	static var sinv : number;
	static var cosv : number;
	static var sinh : number;
	static var cosh : number;

	// 内部演算用 マウス移動量差分を求める変数
	static var _tempmdn : boolean;
	static var _tempmx : int = 0;
	static var _tempmy : int = 0;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Ccvs.scale = 1;
		Ccvs.rotv = Math.PI / 180 * 0;
		Ccvs.roth = Math.PI / 180 * 30;
		Ccvs.sinv = Math.sin(Ccvs.rotv);
		Ccvs.cosv = Math.cos(Ccvs.rotv);
		Ccvs.sinh = Math.sin(Ccvs.roth);
		Ccvs.cosh = Math.cos(Ccvs.roth);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		Ccvs.mx = Ctrl.mx - Ctrl.wl;
		Ccvs.my = Ctrl.my - Ctrl.wt;

		// TODO マップモードか確認
		var mapFlag = false;

		// キャンバス内でクリック開始したかの確認
		if(Ccvs._tempmdn != Ctrl.mdn){
			Ccvs._tempmdn = Ctrl.mdn;
			Ccvs.mdn = (Ccvs._tempmdn && 0 < Ccvs.mx && Ccvs.mx < Ctrl.canvas.width && 0 < Ccvs.my && Ccvs.my < Ctrl.canvas.height);
		}

		if(Ccvs.mdn && Ctrl.mmv){
			// マウス移動中
			if(mapFlag){
				// マップモード時地図の水平移動
				var x = Ccvs._tempmx - Ccvs.mx;
				var y = Ccvs._tempmy - Ccvs.my;
				Ccvs.fx += x *  Ccvs.cosv + y * Ccvs.sinv;
				Ccvs.fy += x * -Ccvs.sinv + y * Ccvs.cosv;
			}else{
				// 舞台回転処理
				var x0 = Ccvs._tempmx - Ctrl.canvas.width * 0.5;
				var y0 = Ccvs._tempmy - Ctrl.canvas.height * 0.5;
				var r0 = Math.sqrt(x0 * x0 + y0 * y0);
				var x1 = Ccvs.mx - Ctrl.canvas.width * 0.5;
				var y1 = Ccvs.my - Ctrl.canvas.height * 0.5;
				var r1 = Math.sqrt(x1 * x1 + y1 * y1);
				if(r0 > 20 && r1 > 20){
					var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
					if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
					Ccvs.rotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
					Ccvs.sinv = Math.sin(Ccvs.rotv);
					Ccvs.cosv = Math.cos(Ccvs.rotv);
				}
			}
		}
		Ccvs._tempmx = Ccvs.mx;
		Ccvs._tempmy = Ccvs.my;

		if(!mapFlag){
			// 中心をプレイヤー位置に寄せる
			Ccvs.fx += (Ccvs.px - Ccvs.fx) * 0.3;
			Ccvs.fy += (Ccvs.py - Ccvs.fy) * 0.3;
		}

		// 水平角度
		var roth = Math.PI / 180 * (mapFlag ? 90 : 30);
		Ccvs.roth += (roth - Ccvs.roth) * 0.1;
		Ccvs.sinh = Math.sin(Ccvs.roth);
		Ccvs.cosh = Math.cos(Ccvs.roth);
		// 拡大縮小
		//var scale = mapFlag ? 0.8 : 2.5;
		//Ccvs.scale += (scale - Ccvs.scale) * 0.1;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

