import 'js/web.jsx';

import "Ccvs.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画単位
abstract class DrawUnit{
	var visible : boolean = false;
	var exist : boolean = true;
	var drz : number;
	abstract function draw(ccvs : Ccvs) : void;
	static function drawList(ccvs : Ccvs, list : DrawUnit[]) : void{
		for(var i = 0; i < list.length; i++){if(!list[i].exist){list.splice(i--,1);}}
		list.sort(function(u0 : Nullable.<DrawUnit>, u1 : Nullable.<DrawUnit>):number{return u0.drz - u1.drz;});
		for(var i = 0; i < list.length; i++){if(list[i].visible){list[i].draw(ccvs); list[i].visible = false;}}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター描画情報クラス
class DrawInfo{
	var weapon : string;
	var parts : Map.<number[][]>;
	var pose : Map.<Map.<number[]>[]>;
	// コンストラクタ
	function constructor(dat : variant) {
		this.weapon = dat["weapon"] as string;
		this.parts  = dat["parts"] as Map.<number[][]>;
		this.pose  = dat["pose"] as Map.<Map.<number[]>[]>;
    }
}

// キャラクタークラス
class DrawCharacter extends DrawUnit{
	var _duList = new DrawUnit[];
	var _parts = {} : Map.<DrawCharacterParts[]>;
	var _pose : Map.<Map.<number[]>[]>;
	var _weapon : DrawCharacterWeapon;
	var _size : number;

	// パーツ描画用変数
	var _img : HTMLImageElement;
	var canvas : HTMLCanvasElement;
	var drX0 : number;
	var drY0 : number;
	var drZ0 : number;
	var drScale : number;
	var drRotv : number;
	var drSin : number;
	var drCos : number;
	var drAngv1 : number;
	var drAngv2 : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(img : HTMLImageElement, drawInfo : DrawInfo, size : number){
		this._img = img;
		this._pose = drawInfo.pose;
		this._size = size;
		// キャラクター画像彩色用キャンバス設定
		this.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this.canvas.width = this._img.width;
		this.canvas.height = this._img.height;
		this.setColor("");

		// パーツの登録
		for(var i in drawInfo.parts){
			this._parts[i] = new DrawCharacterParts[];
			for(var j = 0; j < drawInfo.parts[i].length; j++){
				var temp = drawInfo.parts[i][j];
				var x = temp[0];
				var y = temp[1];
				var z = temp[2];
				var u = Math.round(temp[3]);
				var v = Math.round(temp[4]);
				var s = Math.round(temp[5]);
				var swap = (Math.round(temp[6]) > 0);
				this._parts[i][j] = new DrawCharacterParts(this, x, y, z, u, v, s, swap);
				this._duList.push(this._parts[i][j]);
			}
		}

		// 武器の登録
		if(drawInfo.weapon != ""){
			this._weapon = new DrawCharacterWeapon(this, drawInfo.weapon);
			this._duList.push(this._weapon);
		}
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		var context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		context.drawImage(this._img, 0, 0);
		if(color != ""){
			context.save();
			context.globalCompositeOperation = "source-atop";
			context.fillStyle = color;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			context.restore();
		}
	}

	// ----------------------------------------------------------------
	// モーションのフレーム数獲得
	function getLen(motion : string) : int{
		return this._pose[motion].length;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number, r : number, motion : string, action : int) : void{
		// エラーチェック
		if(this._pose[motion] == null || this._pose[motion][action] == null){return;}

		this.visible = true;
		// ほぼグローバルな位置
		this.drX0 = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		this.drY0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		this.drZ0 = ccvs.scale * z;
		this.drz = this.drY0 * ccvs.cosh + this.drZ0 * ccvs.sinh;
		// 大きさ
		this.drScale = ccvs.scale * this._size;
		// ボディローカルな角度と三角関数
		this.drRotv = ccvs.rotv + r;
		this.drSin = Math.sin(this.drRotv);
		this.drCos = Math.cos(this.drRotv);

		// 姿勢の解釈
		var pose = this._pose[motion][action];
		for(var i in pose){
			if(i == "weapon"){
				// 特殊パーツ 武器
				this._weapon.preDraw(ccvs, pose[i]);
			}else{
				// 体のパーツ
				for(var j in this._parts[i]){
					this._parts[i][j].preDraw(ccvs, pose[i]);
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		DrawUnit.drawList(ccvs, this._duList);
	}
}

// 体のパーツクラス
class DrawCharacterParts extends DrawUnit{
	var _character : DrawCharacter;
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

	var _drx : number;
	var _dry : number;
	var _dru : int;
	var _drv : int;
	var _yswap : boolean;
	var _zswap : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(character : DrawCharacter, x2 : number, y2 : number, z2 : number, u : int, v : int, uvsize : int, swap : boolean){
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
	function preDraw(ccvs : Ccvs, pose : number[]) : void{
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
		this._drx = this._character.drX0 + this._character.drScale * 35 * (x1 * this._character.drCos - y1 * this._character.drSin);
		var y0 = this._character.drY0 + this._character.drScale * 35 * (x1 * this._character.drSin + y1 * this._character.drCos);
		var z0 = this._character.drZ0 + this._character.drScale * 35 * (z1 - 0.05);
		this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;

		// 視点を考慮したuv座標設定
		this._dru = this._u + av * this._uvsize;
		this._drv = this._v;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = (this._uvsize * this._character.drScale) as int;
		var px = (this._drx - ps * 0.5 + ccvs.width * 0.5) as int;
		var py = (this._dry - ps * 0.5 + ccvs.height * 0.5) as int;
		if(px + ps < 0 || px - ps > ccvs.width || py + ps < 0 || py - ps > ccvs.height){
		}else if(this._yswap || this._zswap){
			var rx = px + ps * 0.5;
			var ry = py + ps * 0.5;
			ccvs.context.save();
			ccvs.context.translate(rx, ry);
			ccvs.context.scale(this._yswap ? -1 : 1, this._zswap ? -1 : 1);
			ccvs.context.translate(-rx, -ry);
			ccvs.context.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, px, py, ps, ps);
			ccvs.context.restore();
		}else{
			ccvs.context.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, px, py, ps, ps);
		}
	}
}

// 武器とその軌跡クラス
class DrawCharacterWeapon extends DrawUnit{
	static var drawed : Map.<HTMLCanvasElement> = {} : Map.<HTMLCanvasElement>;

	var _character : DrawCharacter;
	var _canvas : HTMLCanvasElement = null;

	var _drx : number;
	var _dry : number;
	var _drr : number;
	var _action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(character : DrawCharacter, weapon : string){
		this._character = character;

		if(DrawCharacterWeapon.drawed[weapon] == null){
			// 武器画像作成
			this._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
			switch(weapon){
				case "whiteSword": case "redSword":
					// ステップ毎の軌跡開始角度と終了角度
					var rslist = [-45 * Math.PI / 180, -45 * Math.PI / 180, -45 * Math.PI / 180, 45 * Math.PI / 180];
					var rglist = [-45 * Math.PI / 180, -20 * Math.PI / 180,  45 * Math.PI / 180, 45 * Math.PI / 180];
					this._canvas.height = 48;
					this._canvas.width = this._canvas.height * rslist.length;
					// 剣の長さ
					var len0 = 10;
					var len1 = 33;
					// 剣と軌跡の色と太さ
					switch(weapon){
						case "whiteSword":
							context.strokeStyle = "#fff";
							context.fillStyle = "rgba(255, 255, 255 , 0.5)";
							context.lineWidth = 3;
							break;
						case "redSword":
							context.strokeStyle = "#f00";
							context.fillStyle = "rgba(255, 0, 0 , 0.5)";
							context.lineWidth = 3;
							break;
					}
					// 剣と軌跡描画
					for(var i = 0; i < rslist.length; i++){
						var x = this._canvas.height * i;
						var y = this._canvas.height * 0.5;
						var c = Math.cos(rglist[i]);
						var s = Math.sin(rglist[i]);
						// 剣の軌跡
						context.beginPath();
						context.arc(x, y, len0, rslist[i], rglist[i], false);
						context.arc(x, y, len1, rglist[i], rslist[i], true);
						context.fill();
						// 剣の形
						context.beginPath();	
						context.moveTo(x + len0 * c, y + len0 * s);
						context.lineTo(x + len1 * c, y + len1 * s);
						context.stroke();
					}
					// 武器画像作成完了
					DrawCharacterWeapon.drawed[weapon] = this._canvas;
					//log this._canvas.toDataURL("image/png");
					break;
				default:
					// サーバからもらった画像も使うかも
					break;
			}
		}else{
			// 同じ画像を既に作っていれば使い回す
			this._canvas = DrawCharacterWeapon.drawed[weapon];
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, pose : number[]) : void{
		this.visible = true;
		this._action = Math.round(pose[0]);

		// パーツローカル角度の確認
		this._drr = this._character.drRotv + Math.PI * pose[4] / 180;

		// ボディローカル座標
		var x1 = pose[1];
		var y1 = pose[2];
		var z1 = pose[3];
		// グローバル座標
		this._drx = this._character.drX0 + this._character.drScale * 35 * (x1 * this._character.drCos - y1 * this._character.drSin);
		var y0 = this._character.drY0 + this._character.drScale * 35 * (x1 * this._character.drSin + y1 * this._character.drCos);
		var z0 = this._character.drZ0 + this._character.drScale * 35 * (z1 - 0.05);
		this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = this._canvas.height * this._character.drScale;
		var px = this._drx + ccvs.width * 0.5;
		var py = this._dry + ccvs.height * 0.5;
		ccvs.context.save();
		ccvs.context.translate(px, py);
		ccvs.context.scale(1, ccvs.sinh);
		ccvs.context.rotate(this._drr);
		ccvs.context.translate(ps * -0.5, ps * -0.5);
		ccvs.context.drawImage(this._canvas, this._canvas.height * this._action, 0, this._canvas.height, this._canvas.height, 0, 0, ps, ps);
		ccvs.context.restore();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 影クラス

class DrawShadow extends DrawUnit{
	static var _canvas : HTMLCanvasElement = null;

	var _size : number;

	var _drx : number;
	var _dry : number;
	var _drScale : number;
	
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(size : number){
		// 影画像作成
		if(DrawShadow._canvas == null){
			DrawShadow._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = DrawShadow._canvas.getContext("2d") as CanvasRenderingContext2D;
			DrawShadow._canvas.width = DrawShadow._canvas.height = 32;
			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.arc(16, 16, 15, 0, Math.PI * 2.0, true);
			context.fill();
		}
		// 影の大きさ
		this._size = size;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number) : void{
		this.visible = true;
		// 位置
		this._drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		var z0 = ccvs.scale * z;
		this._dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
		this._drScale = ccvs.scale * this._size;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var psx = (16 * this._drScale) as int;
		var psy = (psx * ccvs.sinh) as int;
		var px = (this._drx - psx * 0.5 + ccvs.width * 0.5) as int;
		var py = (this._dry - psy * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(DrawShadow._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 文字列クラス
class DrawTest extends DrawUnit{
	var _canvas : HTMLCanvasElement = null;

	var _drx : number;
	var _dry : number;
	var _drScale : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(txt : string){
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
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number, s : number) : void{
		this.visible = true;
		// 位置
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

// 吹き出しクラス
class DrawBalloon extends DrawUnit{
	var _canvas : HTMLCanvasElement = null;
	var _context : CanvasRenderingContext2D;

	var _drx : number;
	var _dry : number;
	var _drScale : number;
	var _action : int;
	var _time : int;

	// ----------------------------------------------------------------
	// 文字列設定
	function setText(txt : string, time : int) : void{
		if(txt != ""){
			this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

			var size = 24;
			this._context.font = size as string + "px 'monospace'";
			var measure = this._context.measureText(txt);

			this._context.fillStyle = "rgba(255, 255, 255, 0.8)";
			var w = measure.width + 20;
			var h = size + 20;
			var l = (this._canvas.width - w) * 0.5;
			var t = this._canvas.height - h - 15;
			var r = 10;
			this._context.beginPath();
			this._context.arc(l +     r, t +     r, r, -Math.PI, -0.5 * Math.PI, false);
			this._context.arc(l + w - r, t +     r, r, -0.5 * Math.PI, 0, false);
			this._context.arc(l + w - r, t + h - r, r, 0, 0.5 * Math.PI, false);
			this._context.lineTo(this._canvas.width * 0.5 + 8, this._canvas.height - 15);
			this._context.lineTo(this._canvas.width * 0.5 + 0, this._canvas.height);
			this._context.lineTo(this._canvas.width * 0.5 - 8, this._canvas.height - 15);
			this._context.arc(l +     r, t + h - r, r, 0.5 * Math.PI, Math.PI, false);
			this._context.closePath();
			this._context.stroke();
			this._context.fill();

			this._context.fillStyle = "black";
			this._context.fillText(txt, this._canvas.width * 0.5, this._canvas.height - size * 0.5 - 10 - 15);

			this._action = 0;
			this._time = time;
		}else{
			this._time = 0;
		}
	}

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this._canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = 512;
		this._canvas.height = 64;
		this._context.textAlign = "center";
		this._context.textBaseline = "middle";
		this._action = 0;
		this._time = 0;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number, s : number) : void{
		if(this._action++ < this._time || this._time < 0){
			this.visible = true;
			// 位置
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
		var psx = (this._canvas.width * 0.5 * this._drScale) as int;
		var psy = (this._canvas.height * 0.5 * this._drScale) as int;

		if(this._action < 10){
			var size = 0.2 * Math.sin(Math.PI * 2 * this._action / 10);
			psx *= 1 + size;
			psy *= 1 - size;
		}
		
		var px = (this._drx - psx * 0.5 + ccvs.width * 0.5) as int;
		var py = (this._dry - psy * 1.0 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

