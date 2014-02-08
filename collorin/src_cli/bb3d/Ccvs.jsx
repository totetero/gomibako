import "js/web.jsx";

import "../util/EventCartridge.jsx";
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

	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement, width : int, height : int, rotv : number, roth : number, scale : number){
		this.width = width;
		this.height = height;
		// DOM獲得
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		// ピクセルレシオ設定
		var PixelRatio = dom.window.devicePixelRatio;
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
			this.mdn = (clickable && this._tempmdn && 0 < this.mx && this.mx < this.width && 0 < this.my && this.my < this.height);
		}
	}

	// タッチによる回転の計算
	function calcTouchRotate() : void{
		if(this.mdn && Ctrl.mmv){
			// 舞台回転処理
			var x0 = this.prevmx - this.width * 0.5;
			var y0 = this.prevmy - this.height * 0.5;
			var r0 = Math.sqrt(x0 * x0 + y0 * y0);
			var x1 = this.mx - this.width * 0.5;
			var y1 = this.my - this.height * 0.5;
			var r1 = Math.sqrt(x1 * x1 + y1 * y1);
			if(r0 > 20 && r1 > 20){
				var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
				if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
				this.rotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
				// 垂直角度処理
				this.sinv = Math.sin(this.rotv);
				this.cosv = Math.cos(this.rotv);
			}
		}
	}

	// 角度拡縮結果の計算
	function calcRotate(rotv : number, roth : number, scale : number) : void{
		// 垂直角度
		while(this.rotv < -Math.PI){this.rotv += Math.PI * 2;}
		while(this.rotv > Math.PI){this.rotv -= Math.PI * 2;}
		var drv = this.rotv - rotv;
		if(Math.abs(drv) > 0.01){
			this.rotv -= drv * 0.1;
			this.sinv = Math.sin(this.rotv);
			this.cosv = Math.cos(this.rotv);
		}
		// 水平角度
		var drh = this.roth - roth;
		if(Math.abs(drh) > 0.01){
			this.roth -= drh * 0.1;
			this.sinh = Math.sin(this.roth);
			this.cosh = Math.cos(this.roth);
		}
		// 拡大縮小
		this.scale -= (this.scale - scale) * 0.1;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

