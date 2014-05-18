import "js/web.jsx";

import "../util/Ctrl.jsx";
import "../util/Sound.jsx";
import "../util/Drawer.jsx";
import "../util/Loader.jsx";
import "../util/Loading.jsx";
import "../util/EventCartridge.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dCanvas{
	var x : int;
	var y : int;
	var w : int;
	var h : int;
	// 画面回転拡大
	var rotv : number;
	var roth : number;
	var scale : number;
	var sinv : number;
	var cosv : number;
	var sinh : number;
	var cosh : number;

	// コンストラクタ
	function constructor(rotv : number, roth : number, scale : number){
		this.rotv = rotv;
		this.roth = roth;
		this.scale = scale;
		this.sinv = Math.sin(this.rotv);
		this.cosv = Math.cos(this.rotv);
		this.sinh = Math.sin(this.roth);
		this.cosh = Math.cos(this.roth);
	}
}

// キャンバス情報管理 スクリーン全面使用
class Bb3dCanvasFullscreen extends Bb3dCanvas{
	// マウス状態 キャンバスとの相対位置
	var stx : int = 0;
	var sty : int = 0;
	var prevstx : int;
	var prevsty : int;
	var _tempstdn : boolean;
	// ゲーム座標タッチ位置
	var tx : number;
	var ty : number;
	// ゲーム座標カメラ位置
	var cx : number;
	var cy : number;
	var cxmax : number = 0;
	var cymax : number = 0;
	var cxmin : number = 0;
	var cymin : number = 0;
	// 移動回転の計算値
	var calcx : number;
	var calcy : number;
	var calcrotv : number;

	// コンストラクタ
	function constructor(rotv : number, roth : number, scale : number){
		super(rotv, roth, scale);
		this.x = 0;
		this.y = 0;
		this.calcrotv = this.rotv;
	}

	// マウス状態とタッチ状態の計算
	function calcTouchCoordinate() : void{
		this.w = Ctrl.screen.w;
		this.h = Ctrl.screen.h;
		// キャンバスからみたマウス位置を確認
		this.prevstx = this.stx;
		this.prevsty = this.sty;
		this.stx = Ctrl.stx;
		this.sty = Ctrl.sty;
		// クリック開始時に直前座標リセット
		if(this._tempstdn != Ctrl.stdn){
			this._tempstdn = Ctrl.stdn;
			if(this._tempstdn){
				this.prevstx = this.stx;
				this.prevsty = this.sty;
			}
		}
		// マウス位置をゲーム座標タッチ位置に変換
		var x0 = (this.stx - this.w * 0.5) / this.scale;
		var y0 = (this.sty - this.h * 0.5) / (this.scale * this.sinh);
		this.tx = (x0 *  this.cosv + y0 * this.sinv) + this.cx;
		this.ty = (x0 * -this.sinv + y0 * this.cosv) + this.cy;
	}

	// タッチによる移動の計算
	function calcTouchMove() : void{
		if(Ctrl.stdn && Ctrl.stmv){
			var x1 = this.cxmax * this.cosv + this.cymax * -this.sinv;
			var y1 = this.cxmax * this.sinv + this.cymax *  this.cosv;
			var x2 = this.cxmax * this.cosv + this.cymin * -this.sinv;
			var y2 = this.cxmax * this.sinv + this.cymin *  this.cosv;
			var x3 = this.cxmin * this.cosv + this.cymax * -this.sinv;
			var y3 = this.cxmin * this.sinv + this.cymax *  this.cosv;
			var x4 = this.cxmin * this.cosv + this.cymin * -this.sinv;
			var y4 = this.cxmin * this.sinv + this.cymin *  this.cosv;
			var xmax = Math.max(x1, x2, x3, x4);
			var ymax = Math.max(y1, y2, y3, y4);
			var xmin = Math.min(x1, x2, x3, x4);
			var ymin = Math.min(y1, y2, y3, y4);

			var x0 = (this.calcx * this.cosv + this.calcy * -this.sinv) + (this.prevstx - this.stx) / this.scale;
			var y0 = (this.calcx * this.sinv + this.calcy *  this.cosv) + (this.prevsty - this.sty) / (this.scale * this.sinh);
			if(x0 > xmax){x0 = xmax;}else if(x0 < xmin){x0 = xmin;}
			if(y0 > ymax){y0 = ymax;}else if(y0 < ymin){y0 = ymin;}
			this.calcx = x0 *  this.cosv + y0 * this.sinv;
			this.calcy = x0 * -this.sinv + y0 * this.cosv;
		}
	}

	// タッチによる回転の計算
	function calcTouchRotate() : void{
		if(Ctrl.stdn && Ctrl.stmv){
			var x0 = this.prevstx - this.w * 0.5;
			var y0 = this.prevsty - this.h * 0.5;
			var r0 = Math.sqrt(x0 * x0 + y0 * y0);
			var x1 = this.stx - this.w * 0.5;
			var y1 = this.sty - this.h * 0.5;
			var r1 = Math.sqrt(x1 * x1 + y1 * y1);
			if(r0 > 20 && r1 > 20){
				var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
				if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
				this.calcrotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
			}
		}
	}

	// 垂直角度の減衰計算
	function calcRotv(rotv : number, rate : number) : void{
		var drv = this.rotv - rotv;
		while(drv < -Math.PI){drv += Math.PI * 2;}
		while(drv > Math.PI){drv -= Math.PI * 2;}
		if(Math.abs(drv) > 0.01){
			this.rotv -= drv * rate;
			this.sinv = Math.sin(this.rotv);
			this.cosv = Math.cos(this.rotv);
		}
	}

	// 水平角度の減衰計算
	function calcRoth(roth : number, rate : number) : void{
		var drh = this.roth - roth;
		if(Math.abs(drh) > 0.01){
			this.roth -= drh * rate;
			this.sinh = Math.sin(this.roth);
			this.cosh = Math.cos(this.roth);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

