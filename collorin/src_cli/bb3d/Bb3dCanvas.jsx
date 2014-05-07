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
	// マウス状態 キャンバスとの相対位置
	var tdn : boolean;
	var tx : int = 0;
	var ty : int = 0;
	var prevtx : int;
	var prevty : int;
	var trigger_tup : boolean;
	var _temptdn : boolean;
	// ゲーム画面キャンバス座標系 タッチ位置
	var touchx : number;
	var touchy : number;
	// ゲーム画面キャンバス座標系 カメラ位置
	var camerax : number;
	var cameray : number;
	var cameraxmax : number = 0;
	var cameraymax : number = 0;
	var cameraxmin : number = 0;
	var cameraymin : number = 0;
	// ゲーム画面キャンバス 画面拡大回転
	var rotv : number;
	var roth : number;
	var scale : number;
	var sinv : number;
	var cosv : number;
	var sinh : number;
	var cosh : number;
	// 移動回転の計算値
	var calcx : number;
	var calcy : number;
	var calcrotv : number;

	// コンストラクタ
	function constructor(x : int, y : int, w : int, h : int, rotv : number, roth : number, scale : number){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.rotv = rotv;
		this.roth = roth;
		this.scale = scale;
		this.sinv = Math.sin(this.rotv);
		this.cosv = Math.cos(this.rotv);
		this.sinh = Math.sin(this.roth);
		this.cosh = Math.cos(this.roth);
		this.calcrotv = this.rotv;
	}

	// マウス状態とタッチ状態の計算
	function calcTouchCoordinate(clickable : boolean) : void{
		// キャンバスからみたマウス位置を確認
		this.prevtx = this.tx;
		this.prevty = this.ty;
		this.tx = Ctrl.ctx - this.x;
		this.ty = Ctrl.cty - this.y;
		// マウス位置をゲーム座標タッチ位置に変換
		var x0 = (this.tx - this.w * 0.5) / this.scale;
		var y0 = (this.ty - this.h * 0.5) / (this.scale * this.sinh);
		this.touchx = (x0 *  this.cosv + y0 * this.sinv) + this.camerax;
		this.touchy = (x0 * -this.sinv + y0 * this.cosv) + this.cameray;
		// キャンバス内でクリック開始したかの確認
		if(this._temptdn != Ctrl.ctdn){
			this._temptdn = Ctrl.ctdn;
			if(this.tdn && !Ctrl.ctdn){this.trigger_tup = true;}
			this.tdn = (clickable && this._temptdn && this.x < this.tx && this.tx < this.x + this.w && this.y < this.ty && this.ty < this.y + this.h);
			if(this._temptdn){
				this.prevtx = this.tx;
				this.prevty = this.ty;
			}
		}
	}

	// タッチによる移動の計算
	function calcTouchMove() : void{
		if(this.tdn && Ctrl.ctmv){
			var x1 = this.cameraxmax * this.cosv + this.cameraymax * -this.sinv;
			var y1 = this.cameraxmax * this.sinv + this.cameraymax *  this.cosv;
			var x2 = this.cameraxmax * this.cosv + this.cameraymin * -this.sinv;
			var y2 = this.cameraxmax * this.sinv + this.cameraymin *  this.cosv;
			var x3 = this.cameraxmin * this.cosv + this.cameraymax * -this.sinv;
			var y3 = this.cameraxmin * this.sinv + this.cameraymax *  this.cosv;
			var x4 = this.cameraxmin * this.cosv + this.cameraymin * -this.sinv;
			var y4 = this.cameraxmin * this.sinv + this.cameraymin *  this.cosv;
			var xmax = Math.max(x1, x2, x3, x4);
			var ymax = Math.max(y1, y2, y3, y4);
			var xmin = Math.min(x1, x2, x3, x4);
			var ymin = Math.min(y1, y2, y3, y4);

			var x0 = (this.calcx * this.cosv + this.calcy * -this.sinv) + (this.prevtx - this.tx) / this.scale;
			var y0 = (this.calcx * this.sinv + this.calcy *  this.cosv) + (this.prevty - this.ty) / (this.scale * this.sinh);
			if(x0 > xmax){x0 = xmax;}else if(x0 < xmin){x0 = xmin;}
			if(y0 > ymax){y0 = ymax;}else if(y0 < ymin){y0 = ymin;}
			this.calcx = x0 *  this.cosv + y0 * this.sinv;
			this.calcy = x0 * -this.sinv + y0 * this.cosv;
		}
	}

	// タッチによる回転の計算
	function calcTouchRotate() : void{
		if(this.tdn && Ctrl.ctmv){
			var x0 = this.prevtx - this.w * 0.5;
			var y0 = this.prevty - this.h * 0.5;
			var r0 = Math.sqrt(x0 * x0 + y0 * y0);
			var x1 = this.tx - this.w * 0.5;
			var y1 = this.ty - this.h * 0.5;
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

