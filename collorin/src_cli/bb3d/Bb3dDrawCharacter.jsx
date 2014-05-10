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

// class Bb3dDrawCharacterMotionの定義はLoader.jsx ローダーで管理する

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class Bb3dDrawCharacter extends Bb3dDrawUnit{
	var _duList = new Bb3dDrawUnit[];
	var _parts = {} : Map.<Bb3dDrawCharacterParts[]>;
	var _pose : Map.<Map.<number[]>[]>;
	var _scale : number;

	// パーツ描画用変数
	var _img : HTMLImageElement;
	var canvas : HTMLCanvasElement;
	var drX0 : number;
	var drY0 : number;
	var drZ0 : number;
	var drRotv : number;
	var drSin : number;
	var drCos : number;
	var drAngv1 : number;
	var drAngv2 : number;
	// 描画範囲
	var minx : int;
	var miny : int;
	var maxx : int;
	var maxy : int;

	// 変更変数
	var _color = "none";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(img : HTMLImageElement, motion : Bb3dDrawCharacterMotion, scale : number){
		this._img = img;
		this._pose = motion.pose;
		this._scale = scale;
		// キャラクター画像彩色用キャンバス設定
		this.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this.canvas.width = this._img.width;
		this.canvas.height = this._img.height;
		this.setColor("");

		// パーツの登録
		for(var i in motion.parts){
			this._parts[i] = new Bb3dDrawCharacterParts[];
			for(var j = 0; j < motion.parts[i].length; j++){
				var temp = motion.parts[i][j];
				var x = temp[0];
				var y = temp[1];
				var z = temp[2];
				var u = Math.round(temp[3]);
				var v = Math.round(temp[4]);
				var s = Math.round(temp[5]);
				var swap = (Math.round(temp[6]) > 0);
				this._parts[i][j] = new Bb3dDrawCharacterParts(this, x, y, z, u, v, s, swap);
				this._duList.push(this._parts[i][j]);
			}
		}
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		if(this._color == color){return;}
		this._color = color;
		var context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		context.drawImage(this._img, 0, 0);
		if(color == ""){return;}
		context.save();
		context.globalCompositeOperation = "source-atop";
		context.fillStyle = color;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		context.restore();
	}

	// ----------------------------------------------------------------
	// モーションのフレーム数獲得
	function getLen(motion : string) : int{
		return this._pose[motion].length;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dCanvas, x : number, y : number, z : number, r : number, motion : string, action : int) : void{
		// エラーチェック
		if(this._pose[motion] == null || this._pose[motion][action] == null){return;}

		this.visible = true;
		// ほぼグローバルな位置
		this.drX0 = bcvs.scale * (x * bcvs.cosv - y * bcvs.sinv);
		this.drY0 = bcvs.scale * (x * bcvs.sinv + y * bcvs.cosv);
		this.drZ0 = bcvs.scale * z;
		this.drz = this.drY0 * bcvs.cosh + this.drZ0 * bcvs.sinh;
		// 大きさ
		this.drScale = bcvs.scale * this._scale;
		// ボディローカルな角度と三角関数
		this.drRotv = bcvs.rotv + r;
		this.drSin = Math.sin(this.drRotv);
		this.drCos = Math.cos(this.drRotv);

		// 姿勢の解釈
		var pose = this._pose[motion][action];
		for(var i in pose){
			if(i == "weapon"){
				// 特殊パーツ 武器
			}else{
				// 体のパーツ
				for(var j in this._parts[i]){
					this._parts[i][j].preDraw(bcvs, pose[i]);
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// パーツの描画準備
	function preDrawParts(bcvs : Bb3dCanvas, parts : Bb3dDrawUnit, x1 : number, y1 : number, z1 : number) : void{
		parts.drx = this.drX0 + this.drScale * 35 * (x1 * this.drCos - y1 * this.drSin);
		var y0 = this.drY0 + this.drScale * 35 * (x1 * this.drSin + y1 * this.drCos);
		var z0 = this.drZ0 + this.drScale * 35 * (z1 - 0.05);
		parts.dry = y0 * bcvs.sinh - z0 * bcvs.cosh;
		parts.drz = y0 * bcvs.cosh + z0 * bcvs.sinh;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		this.minx = bcvs.x + bcvs.w;
		this.miny = bcvs.y + bcvs.h;
		this.maxx = bcvs.x;
		this.maxy = bcvs.y;
		Bb3dDrawUnit.drawList(bcvs, this._duList);
		//Ctrl.gctx.strokeRect(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny);
		//Ctrl.gctx.beginPath(); for(var i = 0; i <= 20; i++){Ctrl.gctx.lineTo(((this.maxx + this.minx) + (this.maxx - this.minx) * Math.cos(Math.PI * (i / 10))) * 0.5, ((this.maxy + this.miny) + (this.maxy - this.miny) * Math.sin(Math.PI * (i / 10))) * 0.5);} Ctrl.gctx.stroke();
	}
}

// 体のパーツクラス
class Bb3dDrawCharacterParts extends Bb3dDrawUnit{
	var _character : Bb3dDrawCharacter;
	// パーツローカル座標
	var _x2 : number;
	var _y2 : number;
	var _z2 : number;
	// テクスチャ情報
	var _u : int;
	var _v : int;
	var _uvsize : int;
	// 左右反転フラグ
	var _swap : boolean;

	var _dru : int;
	var _drv : int;
	var _yswap : boolean;
	var _zswap : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(character : Bb3dDrawCharacter, x2 : number, y2 : number, z2 : number, u : int, v : int, uvsize : int, swap : boolean){
		this._character = character;
		this._x2 = x2;
		this._y2 = y2;
		this._z2 = z2;
		this._u = u;
		this._v = v;
		this._uvsize = uvsize;
		this._swap = swap;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dCanvas, pose : number[]) : void{
		this.visible = true;
		var type = Math.round(pose[0]);

		// パーツローカル角度
		var rotv = Math.PI * pose[4] / 180;
		// テクスチャ垂直軸角度フレーム
		var av = 0;
		switch(type){
			case 1: case 2: case 3: case 4: av = Math.round(1 - (180 / Math.PI * (this._character.drRotv + rotv)) / 90) % 4; while(av < 0){av += 4;} break;
			case 5: av = Math.round(1 - (180 / Math.PI * (this._character.drRotv + rotv)) / 45) % 4; while(av < 0){av += 4;} break; // TODO まだ適当
		}

		// パーツローカル座標の反転確認
		var x2 = this._x2;
		var y2 = this._y2;
		var z2 = this._z2;
		this._yswap = false;
		this._zswap = false;
		// 上下反転
		if(type == 3 || type == 4){
			this._zswap = !this._zswap;
			z2 *= -1;
		}
		// 前後反転
		if(type == 2 || type == 3){
			if(av == 0){av = 2;}else if(av == 2){av = 0;}
			this._yswap = !this._yswap;
			x2 *= -1;
		}
		// 左右反転
		if(this._swap){
			if(av == 1){av = 3;}else if(av == 3){av = 1;}
			this._yswap = !this._yswap;
		}
		// パーツローカル回転
		if(pose[4] != 0){
			var cos = Math.cos(rotv);
			var sin = Math.sin(rotv);
			var x2r = x2 * cos - y2 * sin;
			var y2r = x2 * sin + y2 * cos;
			x2 = x2r;
			y2 = y2r;
		}

		// ボディローカル座標
		var x1 = pose[1] + x2;
		var y1 = pose[2] + y2;
		var z1 = pose[3] + z2;
		// グローバル座標
		this._character.preDrawParts(bcvs, this, x1, y1, z1);

		// 視点を考慮したuv座標設定
		this._dru = this._u + av * this._uvsize;
		this._drv = this._v;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var s2 = (this._uvsize * 0.5 * this._character.drScale) as int;
		var s1 = (s2 * 0.5) as int;
		var xc = (this.drx + bcvs.x + bcvs.w * 0.5) as int;
		var yc = (this.dry + bcvs.y + bcvs.h * 0.5) as int;
		var xm = xc - s1;
		var ym = yc - s1;
		var xp = xc + s1;
		var yp = yc + s1;
		if(bcvs.x < xp || xm < bcvs.x + bcvs.w || bcvs.y < yp || ym < bcvs.y + bcvs.h){
			// 描画範囲の記憶
			if(this._character.minx > xm){this._character.minx = xm;}
			if(this._character.miny > ym){this._character.miny = ym;}
			if(this._character.maxx < xp){this._character.maxx = xp;}
			if(this._character.maxy < yp){this._character.maxy = yp;}
			// 描画
			if(this._yswap || this._zswap){
				Ctrl.gctx.save();
				Ctrl.gctx.translate(xc, yc);
				Ctrl.gctx.scale(this._yswap ? -1 : 1, this._zswap ? -1 : 1);
				Ctrl.gctx.translate(-xc, -yc);
				Ctrl.gctx.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, xm, ym, s2, s2);
				Ctrl.gctx.restore();
			}else{
				Ctrl.gctx.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, xm, ym, s2, s2);
			}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

