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
	// ----------------------------------------------------------------
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
	// テクスチャ情報
	var _u : int;
	var _v : int;
	var _size : int;
	var _zCenter : number;

	var _x : int;
	var _y : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this._img = Loader.imgs["img_effect_star01"];
		this._u = 0;
		this._v = 0;
		this._size = 16;
		this._zCenter = -0.20 * 0;
		this._x = 190 + Math.random() * 20;
		this._y = 190 + Math.random() * 20;
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(ccvs : Ccvs, cx : number, cy : number) : void{
		this.visible = true;
		// テスト
		var x = this._x - cx;
		var y = this._y - cy;
		var z = 0;
		var s = 1;
		// 位置
		this._drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		var z0 = ccvs.scale * z;
		var z1 = z0 - this._drScale * 35 * this._zCenter; // ???
		this._dry = y0 * ccvs.sinh - z1 * ccvs.cosh;
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

