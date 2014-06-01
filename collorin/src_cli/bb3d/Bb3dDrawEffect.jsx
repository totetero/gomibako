import 'js/web.jsx';

import "../util/Ctrl.jsx";
import "../util/Sound.jsx";
import "../util/Drawer.jsx";
import "../util/Loader.jsx";
import "../util/Loading.jsx";
import "../util/EventCartridge.jsx";

import "Bb3dCanvas.jsx";
import "Bb3dDrawUnit.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// エフェクトクラス
abstract class Bb3dDrawEffect extends Bb3dDrawUnit{
	// 位置情報
	var x : number;
	var y : number;
	var z : number;
	// 計算
	abstract function calc() : void;
}

// 使い捨てエフェクトクラス
abstract class Bb3dDrawEffectOnce extends Bb3dDrawEffect{
	// 使い捨て情報
	var _used = false;

	// ----------------------------------------------------------------
	// 計算
	override function calc() : void{
		if(!this._used){this._used = true;}
		else{this.exist = false;}
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(bcvs : Bb3dCanvas, x : number, y : number, z : number) : void{
		if(this._used){super.preDraw(bcvs, x, y, z);}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// はねる画像エフェクトクラス
class Bb3dDrawEffectHopImage extends Bb3dDrawEffect{
	var _img : HTMLImageElement;
	// 位置情報
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
		this.x = x;
		this.y = y;
		this.z = 0;
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
		this.x += this._vx;
		this.y += this._vy;
		this.z += this._vz;
		if(this.z < 0){this.exist = false;}
		// テクスチャきりかえ
		this._u = this._size * (((this._action++ / 6) as int) % 2);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var ps = (this._size * 0.5 * bcvs.scale) as int;
		var px = (this.drx - ps * 0.5 + bcvs.x + bcvs.centerx) as int;
		var py = (this.dry - ps * 0.5 + bcvs.y + bcvs.centery) as int;
		Ctrl.gctx.drawImage(this._img, this._u, this._v, this._size, this._size, px, py, ps, ps);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// はねる数値エフェクトクラス
class Bb3dDrawEffectHopNumber extends Bb3dDrawEffect{
	var _canvas : HTMLCanvasElement;
	// 位置情報
	var _vx : number;
	var _vy : number;
	var _vz : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(txt : string, x : number, y : number){
		// TODO Drawer使用
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
		this.x = x;
		this.y = y;
		this.z = 0;
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
		this.x += this._vx;
		this.y += this._vy;
		this.z += this._vz;
		if(this.z < 0){this.exist = false;}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var psx = (this._canvas.width * 0.5 * bcvs.scale) as int;
		var psy = (this._canvas.height * 0.5 * bcvs.scale) as int;
		var px = (this.drx - psx * 0.5 + bcvs.x + bcvs.centerx) as int;
		var py = (this.dry - psy * 0.5 + bcvs.y + bcvs.centery) as int;
		Ctrl.gctx.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ビーム画像エフェクトクラス
class Bb3dDrawEffectBeam extends Bb3dDrawEffectOnce{
	static var _canvas : HTMLCanvasElement = null;

	var _scale : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : number, y : number, z : number, scale : number){
		// パーティクル画像作製
		if(Bb3dDrawEffectBeam._canvas == null){
			Bb3dDrawEffectBeam._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = Bb3dDrawEffectBeam._canvas.getContext("2d") as CanvasRenderingContext2D;
			Bb3dDrawEffectBeam._canvas.width = Bb3dDrawEffectBeam._canvas.height = 32;
			var grd = context.createRadialGradient(16, 16, 0, 16, 16, 16);
			grd.addColorStop(0, "rgba(255, 255, 255, 1)");
			grd.addColorStop(1, "rgba(0, 0, 0, 0)");
			context.fillStyle = grd;
			context.fillRect(0, 0, 32, 32);
		}
		// 初期位置
		this.x = x;
		this.y = y;
		this.z = z;
		this._scale = scale;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var ps = (16 * bcvs.scale * this._scale) as int;
		var cx = (this.drx + bcvs.x + bcvs.centerx) as int;
		var cy = (this.dry + bcvs.y + bcvs.centery) as int;
		var px = (cx - ps * 0.5) as int;
		var py = (cy - ps * 0.5) as int;
		Ctrl.gctx.save();
		Ctrl.gctx.globalCompositeOperation = "lighter";
		Ctrl.gctx.drawImage(Bb3dDrawEffectBeam._canvas, px, py, ps, ps);
		Ctrl.gctx.restore();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

