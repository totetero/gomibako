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

