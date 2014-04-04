import 'js/web.jsx';

import "../util/Loader.jsx";
import "Ccvs.jsx";
import "DrawUnit.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// エフェクトクラス
abstract class DrawEffect extends DrawUnit{
	// 計算
	abstract function calc() : void;
	// 描画準備
	abstract function preDraw(ccvs : Ccvs, cx : number, cy : number) : void;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// はねる画像エフェクトクラス
class DrawEffectHopImage extends DrawEffect{
	var _img : HTMLImageElement;
	var _drx : number;
	var _dry : number;
	var _drScale : number;
	// 位置情報
	var _x : number;
	var _y : number;
	var _z : number;
	var _vx : number;
	var _vy : number;
	var _vz : number;
	// テクスチャ情報
	var _u = 0;
	var _v = 0;
	var _size = 16;
	var _action = 0;


	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : number, y : number){
		this._img = Loader.imgs["img_effect_star01"];
		// 位置初期化
		this._x = x;
		this._y = y;
		this._z = 0;
		var r = Math.PI * 2 * Math.random();
		var s = 1;
		this._vx = s * Math.cos(r);
		this._vy = s * Math.sin(r);
		this._vz = 8 + (Math.random() - 0.5) * 2;
	}


	// ----------------------------------------------------------------
	// 計算
	override function calc() : void{
		// 位置計算
		this._vz -= 1;
		this._x += this._vx;
		this._y += this._vy;
		this._z += this._vz;
		if(this._z < 0){this.exist = false;}
		// テクスチャきりかえ
		this._u = this._size * (((this._action++ / 6) as int) % 2);
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(ccvs : Ccvs, cx : number, cy : number) : void{
		this.visible = true;
		// 位置
		var x = this._x - cx;
		var y = this._y - cy;
		var z = this._z;
		var s = 1;
		this._drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		var z0 = ccvs.scale * z;
		this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
		this._drScale = ccvs.scale * s;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = (this._size * this._drScale) as int;
		var px = (this._drx - ps * 0.5 + ccvs.width * 0.5) as int;
		var py = (this._dry - ps * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(this._img, this._u, this._v, this._size, this._size, px, py, ps, ps);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// はねる数値エフェクトクラス
class DrawEffectHopNumber extends DrawEffect{
	var _canvas : HTMLCanvasElement;
	var _drx : number;
	var _dry : number;
	var _drScale : number;
	// 位置情報
	var _x : number;
	var _y : number;
	var _z : number;
	var _vx : number;
	var _vy : number;
	var _vz : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(txt : string, x : number, y : number){
		var size = 20;
		var lineWidth = 5;
		this._canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		var context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = size * txt.length + lineWidth;
		this._canvas.height = size + lineWidth;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = size as string + "px 'monospace'";
		context.lineWidth = lineWidth;
		context.strokeStyle = "white";
		context.strokeText(txt, this._canvas.width * 0.5, this._canvas.height * 0.5);
		context.fillStyle = "black";
		context.fillText(txt, this._canvas.width * 0.5, this._canvas.height * 0.5);
		// 位置初期化
		this._x = x;
		this._y = y;
		this._z = 0;
		var r = Math.PI * 2 * Math.random();
		var s = 1;
		this._vx = s * Math.cos(r);
		this._vy = s * Math.sin(r);
		this._vz = 9 + (Math.random() - 0.5) * 2;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : void{
		// 位置計算
		this._vz -= 1;
		this._x += this._vx;
		this._y += this._vy;
		this._z += this._vz;
		if(this._z < 0){this.exist = false;}
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(ccvs : Ccvs, cx : number, cy : number) : void{
		this.visible = true;
		// 位置
		var x = this._x - cx;
		var y = this._y - cy;
		var z = this._z;
		var s = 1;
		this._drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		var z0 = ccvs.scale * z;
		this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
		this._drScale = ccvs.scale * s;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var psx = (this._canvas.width * 0.5 * this._drScale) as int;
		var psy = (this._canvas.height * 0.5 * this._drScale) as int;
		var px = (this._drx - psx * 0.5 + ccvs.width * 0.5) as int;
		var py = (this._dry - psy * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ビーム画像エフェクトクラス
class DrawEffectBeam extends DrawEffect{
	var _drx : number;
	var _dry : number;
	var _drScale : number;
	// 位置情報
	var _x : number;
	var _y : number;
	var _z : number;
	var _s : number;
	// 使い捨て情報
	var _used = false;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : number, y : number, z : number, s : number){
		this._x = x;
		this._y = y;
		this._z = z;
		this._s = s;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : void{
		// 使い捨て
		if(!this._used){this._used = true;}
		else{this.exist = false;}
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(ccvs : Ccvs, cx : number, cy : number) : void{
		if(this._used){
			this.visible = true;
			// 位置
			var x = this._x - cx;
			var y = this._y - cy;
			var z = this._z;
			var s = this._s;
			this._drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
			var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
			var z0 = ccvs.scale * z;
			this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
			this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
			this._drScale = ccvs.scale * s;
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var s = (16 * this._drScale) as int;
		var x = (this._drx + ccvs.width * 0.5) as int;
		var y = (this._dry + ccvs.height * 0.5) as int;
		ccvs.context.save();
		ccvs.context.globalCompositeOperation = "lighter";
		var grd = ccvs.context.createRadialGradient(x, y, 0, x, y, s * 0.5);
		grd.addColorStop(0, "rgba(255, 255, 255, 1)");
		grd.addColorStop(1, "rgba(0, 0, 0, 0)");
		ccvs.context.fillStyle = grd;
		ccvs.context.fillRect(x - s * 0.5, y - s * 0.5, s, s);
		ccvs.context.restore();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

