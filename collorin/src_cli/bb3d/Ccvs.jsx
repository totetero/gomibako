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
	var mx : int;
	var my : int;
	// ゲーム画面キャンバス カメラ位置
	var cx : number;
	var cy : number;
	var cxmax : number = 0;
	var cymax : number = 0;
	var cxmin : number = 0;
	var cymin : number = 0;
	// ゲーム画面キャンバス 画面拡大回転
	var scale : number = 1;
	var rotv : number = Math.PI / 180 * 30;
	var roth : number = Math.PI / 180 * 45;
	var sinv : number;
	var cosv : number;
	var sinh : number;
	var cosh : number;

	// コンストラクタ
	function constructor(width : int, height : int, canvas : HTMLCanvasElement){
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
		this.sinv = Math.sin(this.rotv);
		this.cosv = Math.cos(this.rotv);
		this.sinh = Math.sin(this.roth);
		this.cosh = Math.cos(this.roth);
	}
}

// キャンバスコントローラーカートリッジ 継承して使う
abstract class SECctrlCanvas extends EventCartridge{
	var ccvs : Ccvs;
	var _scale : number;
	// 内部演算用 マウス移動量差分を求める変数
	var _tempmdn : boolean;
	var _tempmx : int = 0;
	var _tempmy : int = 0;

	// コンストラクタ
	function constructor(ccvs : Ccvs, scale : number){
		this.ccvs = ccvs;
		this._scale = scale;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		var box = this.ccvs.canvas.getBoundingClientRect();
		this.ccvs.mx = Ctrl.mx + Ctrl.sx - box.left;
		this.ccvs.my = Ctrl.my + Ctrl.sy - box.top;

		// キャンバス内でクリック開始したかの確認
		if(this._tempmdn != Ctrl.mdn){
			this._tempmdn = Ctrl.mdn;
			this.ccvs.mdn = (this._tempmdn && 0 < this.ccvs.mx && this.ccvs.mx < this.ccvs.width && 0 < this.ccvs.my && this.ccvs.my < this.ccvs.height);
		}

		if(this.ccvs.mdn && Ctrl.mmv){
			// 舞台回転処理
			var x0 = this._tempmx - this.ccvs.width * 0.5;
			var y0 = this._tempmy - this.ccvs.height * 0.5;
			var r0 = Math.sqrt(x0 * x0 + y0 * y0);
			var x1 = this.ccvs.mx - this.ccvs.width * 0.5;
			var y1 = this.ccvs.my - this.ccvs.height * 0.5;
			var r1 = Math.sqrt(x1 * x1 + y1 * y1);
			if(r0 > 20 && r1 > 20){
				var cos = (x0 * x1 + y0 * y1) / (r0 * r1);
				if(cos > 1){cos = 1;}else if(cos < -1){cos = -1;}
				this.ccvs.rotv += Math.acos(cos) * ((x0 * y1 - y0 * x1 > 0) ? 1 : -1);
				// 垂直角度処理
				this.ccvs.sinv = Math.sin(this.ccvs.rotv);
				this.ccvs.cosv = Math.cos(this.ccvs.rotv);
			}
		}
		this._tempmx = this.ccvs.mx;
		this._tempmy = this.ccvs.my;

		// 水平角度
		var drh = this.ccvs.roth - Math.PI / 180 * 30;
		if(Math.abs(drh) > 0.01){
			this.ccvs.roth -= drh * 0.1;
			this.ccvs.sinh = Math.sin(this.ccvs.roth);
			this.ccvs.cosh = Math.cos(this.ccvs.roth);
		}
		// 拡大縮小
		this.ccvs.scale += (this._scale - this.ccvs.scale) * 0.1;

		return true;
	}

	// 描画
	override function draw() : void{
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

