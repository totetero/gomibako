import "js/web.jsx";

import "../util/Ctrl.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報
class Ccvs{
	var width : int;
	var height : int;
	var canvas : HTMLCanvasElement;
	var context : CanvasRenderingContext2D;
	// マウス状態 キャンバスとの相対位置
	var mdn : boolean;
	var mx : int = 0;
	var my : int = 0;
	var prevmx : int;
	var prevmy : int;
	var trigger_mup : boolean;
	var _tempmdn : boolean;
	// ゲーム画面キャンバス タッチ位置
	var tx : number;
	var ty : number;
	// ゲーム画面キャンバス カメラ位置
	var cx : number;
	var cy : number;
	var cxmax : number = 0;
	var cymax : number = 0;
	var cxmin : number = 0;
	var cymin : number = 0;
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
	function constructor(canvas : HTMLCanvasElement, width : int, height : int, rotv : number, roth : number, scale : number){
		this.width = width;
		this.height = height;
		// DOM獲得
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		// ピクセルレシオ設定
		var PixelRatio = 1;
		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality == "high"){PixelRatio = dom.window.devicePixelRatio;}
		if(quality == "low"){PixelRatio = 0.5;}
		if(PixelRatio == 1){
			this.canvas.width = this.width;
			this.canvas.height = this.height;
		}else{
			this.canvas.width = Math.floor(this.width * PixelRatio);
			this.canvas.height = Math.floor(this.height * PixelRatio);
			this.context.scale(PixelRatio, PixelRatio);
		}

		// パラメーター初期化
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
		this.prevmx = this.mx;
		this.prevmy = this.my;
		var box = this.canvas.getBoundingClientRect();
		this.mx = Ctrl.mx + Ctrl.sx - box.left;
		this.my = Ctrl.my + Ctrl.sy - box.top;
		// マウス位置をゲーム座標タッチ位置に変換
		var x0 = (this.mx - this.width * 0.5) / this.scale;
		var y0 = (this.my - this.height * 0.5) / (this.scale * this.sinh);
		this.tx = (x0 *  this.cosv + y0 * this.sinv) + this.cx;
		this.ty = (x0 * -this.sinv + y0 * this.cosv) + this.cy;
		// キャンバス内でクリック開始したかの確認
		if(this._tempmdn != Ctrl.mdn){
			this._tempmdn = Ctrl.mdn;
			if(this.mdn && !Ctrl.mdn){this.trigger_mup = true;}
			this.mdn = (clickable && this._tempmdn && 0 < this.mx && this.mx < this.width && 0 < this.my && this.my < this.height);
			if(this._tempmdn){
				this.prevmx = this.mx;
				this.prevmy = this.my;
			}
		}
	}

	// タッチによる移動の計算
	function calcTouchMove() : void{
		if(this.mdn && Ctrl.mmv){
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

			var x0 = (this.calcx * this.cosv + this.calcy * -this.sinv) + (this.prevmx - this.mx) / this.scale;
			var y0 = (this.calcx * this.sinv + this.calcy *  this.cosv) + (this.prevmy - this.my) / (this.scale * this.sinh);
			if(x0 > xmax){x0 = xmax;}else if(x0 < xmin){x0 = xmin;}
			if(y0 > ymax){y0 = ymax;}else if(y0 < ymin){y0 = ymin;}
			this.calcx = x0 *  this.cosv + y0 * this.sinv;
			this.calcy = x0 * -this.sinv + y0 * this.cosv;
		}
	}

	// タッチによる回転の計算
	function calcTouchRotate() : void{
		if(this.mdn && Ctrl.mmv){
			var x0 = this.prevmx - this.width * 0.5;
			var y0 = this.prevmy - this.height * 0.5;
			var r0 = Math.sqrt(x0 * x0 + y0 * y0);
			var x1 = this.mx - this.width * 0.5;
			var y1 = this.my - this.height * 0.5;
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

