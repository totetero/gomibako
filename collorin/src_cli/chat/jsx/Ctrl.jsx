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
	// ゲーム画面キャンバス 画面拡大
	static var scale : number;
	// ゲーム画面キャンバス 画面回転
	static var rotv : number;
	static var roth : number;
	static var rothMin : number;
	static var rothMax : number;
	static var sinv : number;
	static var cosv : number;
	static var sinh : number;
	static var cosh : number;

	// 内部演算用 ゲーム画面用DOM
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	// 内部演算用 ウインドウ状態
	static var wl : int;
	static var wt : int;
	static var ww : int = 0;
	static var wh : int = 0;
	// 内部演算用 回転開始時の状態
	static var tempmx : int;
	static var tempmy : int;
	static var temprotv : number;
	static var temproth : number;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// ゲーム画面canvasの準備
		Ctrl.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.context = Ctrl.canvas.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = 320;
		Ctrl.canvas.height = 320;
		// root divの準備
		Ctrl.div = dom.document.createElement("div") as HTMLDivElement;
		Ctrl.div.style.position = "absolute";
		Ctrl.div.style.overflow = "hidden";
		Ctrl.div.style.width = "100%";
		Ctrl.div.style.height = "100%";
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
		}

		// ゲーム画面キャンバス設定
		Ctrl.scale = 1;
		Ctrl.rotv = Math.PI / 180 * 0;
		Ctrl.roth = Math.PI / 180 * 30;
		Ctrl.rothMin = Math.PI / 180 * 10;
		Ctrl.rothMax = Math.PI / 180 * 90;
		Ctrl.sinv = Math.sin(Ctrl.rotv);
		Ctrl.cosv = Math.cos(Ctrl.rotv);
		Ctrl.sinh = Math.sin(Ctrl.roth);
		Ctrl.cosh = Math.cos(Ctrl.roth);
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
	// マウスを押す
	static function mdnfn(e : Event) : void{
		// マウス座標獲得
		if(Ctrl.isTouch){
			var te = e as TouchEvent;
			Ctrl.mx = te.changedTouches[0].clientX - Ctrl.wl;
			Ctrl.my = te.changedTouches[0].clientY - Ctrl.wt;
		}else{
			var me = e as MouseEvent;
			Ctrl.mx = me.clientX - Ctrl.wl;
			Ctrl.my = me.clientY - Ctrl.wt;
		}

		// タッチ状態
		Ctrl.mdn = true;
		Ctrl.mmv = false;

		// 画面回転処理初期化
		Ctrl.tempmx = Ctrl.mx;
		Ctrl.tempmy = Ctrl.my;
		Ctrl.temprotv = Ctrl.rotv;
		Ctrl.temproth = Ctrl.roth;

		e.preventDefault();
	}

	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void{
		if(Ctrl.mdn){
			// マウス座標獲得
			if(Ctrl.isTouch){
				var te = e as TouchEvent;
				Ctrl.mx = te.changedTouches[0].clientX - Ctrl.wl;
				Ctrl.my = te.changedTouches[0].clientY - Ctrl.wt;
			}else{
				var me = e as MouseEvent;
				Ctrl.mx = me.clientX - Ctrl.wl;
				Ctrl.my = me.clientY - Ctrl.wt;
			}

			if(Ctrl.mmv){
				// 垂直軸画面回転処理
				var x0 = Ctrl.tempmx - Ctrl.canvas.width * 0.5;
				var y0 = Ctrl.tempmy - Ctrl.canvas.height * 0.5;
				var r0 = Math.sqrt(x0 * x0 + y0 * y0);
				var x1 = Ctrl.mx - Ctrl.canvas.width * 0.5;
				var y1 = Ctrl.my - Ctrl.canvas.height * 0.5;
				var r1 = Math.sqrt(x1 * x1 + y1 * y1);
				if(r0 > 20 && r1 > 20){
					var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
					if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
					Ctrl.rotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
					Ctrl.sinv = Math.sin(Ctrl.rotv);
					Ctrl.cosv = Math.cos(Ctrl.rotv);
				}
				// 水平軸画面回転処理
				Ctrl.roth += (Ctrl.my - Ctrl.tempmy) * 0.03;
				if(Ctrl.roth > Ctrl.rothMax){Ctrl.roth = Ctrl.rothMax;}
				if(Ctrl.roth < Ctrl.rothMin){Ctrl.roth = Ctrl.rothMin;}
				Ctrl.sinh = Math.sin(Ctrl.roth);
				Ctrl.cosh = Math.cos(Ctrl.roth);

				Ctrl.tempmx = Ctrl.mx;
				Ctrl.tempmy = Ctrl.my;
			}else{
				// 移動量確認
				var dx = Ctrl.mx - Ctrl.tempmx;
				var dy = Ctrl.my - Ctrl.tempmy;
				Ctrl.mmv = dx * dx + dy * dy > 10;
			}

			e.preventDefault();
		}
	}

	// ----------------------------------------------------------------
	// マウスを離す
	static function mupfn(e : Event) : void{
		Ctrl.mdn = false;

		e.preventDefault();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

