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
	var _size = 32;
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
		super.preDraw(ccvs, this._x - cx, this._y - cy, this._z, 1);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = (this._size * 0.5 * this.drScale) as int;
		var px = (this.drx - ps * 0.5 + ccvs.width * 0.5) as int;
		var py = (this.dry - ps * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(this._img, this._u, this._v, this._size, this._size, px, py, ps, ps);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// はねる数値エフェクトクラス
class DrawEffectHopNumber extends DrawEffect{
	var _canvas : HTMLCanvasElement;
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
		super.preDraw(ccvs, this._x - cx, this._y - cy, this._z, 1);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var psx = (this._canvas.width * 0.5 * this.drScale) as int;
		var psy = (this._canvas.height * 0.5 * this.drScale) as int;
		var px = (this.drx - psx * 0.5 + ccvs.width * 0.5) as int;
		var py = (this.dry - psy * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ビーム画像エフェクトクラス
class DrawEffectBeam extends DrawEffect{
	static var _canvas : HTMLCanvasElement = null;

	var _x : number;
	var _y : number;
	var _z : number;
	var _scale : number;
	// 使い捨て情報
	var _used = false;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : number, y : number, z : number, scale : number){
		// パーティクル画像作製
		if(DrawEffectBeam._canvas == null){
			DrawEffectBeam._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = DrawEffectBeam._canvas.getContext("2d") as CanvasRenderingContext2D;
			DrawEffectBeam._canvas.width = DrawEffectBeam._canvas.height = 32;
			var grd = context.createRadialGradient(16, 16, 0, 16, 16, 16);
			grd.addColorStop(0, "rgba(255, 255, 255, 1)");
			grd.addColorStop(1, "rgba(0, 0, 0, 0)");
			context.fillStyle = grd;
			context.fillRect(0, 0, 32, 32);
		}
		// 初期位置
		this._x = x;
		this._y = y;
		this._z = z;
		this._scale = scale;
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
			super.preDraw(ccvs, this._x - cx, this._y - cy, this._z, this._scale);
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = (16 * this.drScale) as int;
		var cx = (this.drx + ccvs.width * 0.5) as int;
		var cy = (this.dry + ccvs.height * 0.5) as int;
		var px = (cx - ps * 0.5) as int;
		var py = (cy - ps * 0.5) as int;
		ccvs.context.save();
		ccvs.context.globalCompositeOperation = "lighter";
		ccvs.context.drawImage(DrawEffectBeam._canvas, px, py, ps, ps);
		ccvs.context.restore();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

