import 'js/web.jsx';

import "Ccvs.jsx";
import "DrawUnit.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター描画情報クラス
class DrawCharacterInfo{
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
	function constructor(img : HTMLImageElement, drawInfo : DrawCharacterInfo, scale : number){
		this._img = img;
		this._pose = drawInfo.pose;
		this._scale = scale;
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
		this.drScale = ccvs.scale * this._scale;
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
	// パーツの描画準備
	function preDrawParts(ccvs : Ccvs, parts : DrawUnit, x1 : number, y1 : number, z1 : number) : void{
		parts.drx = this.drX0 + this.drScale * 35 * (x1 * this.drCos - y1 * this.drSin);
		var y0 = this.drY0 + this.drScale * 35 * (x1 * this.drSin + y1 * this.drCos);
		var z0 = this.drZ0 + this.drScale * 35 * (z1 - 0.05);
		parts.dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		parts.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		this.minx = ccvs.width;
		this.miny = ccvs.height;
		this.maxx = 0;
		this.maxy = 0;
		DrawUnit.drawList(ccvs, this._duList);
		//ccvs.context.strokeRect(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny);
		//ccvs.context.beginPath(); for(var i = 0; i <= 20; i++){ccvs.context.lineTo(((this.maxx + this.minx) + (this.maxx - this.minx) * Math.cos(Math.PI * (i / 10))) * 0.5, ((this.maxy + this.miny) + (this.maxy - this.miny) * Math.sin(Math.PI * (i / 10))) * 0.5);} ccvs.context.stroke();
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
		this._character.preDrawParts(ccvs, this, x1, y1, z1);

		// 視点を考慮したuv座標設定
		this._dru = this._u + av * this._uvsize;
		this._drv = this._v;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var s2 = (this._uvsize * this._character.drScale) as int;
		var s1 = (s2 * 0.5) as int;
		var xc = (this.drx + ccvs.width * 0.5) as int;
		var yc = (this.dry + ccvs.height * 0.5) as int;
		var xm = xc - s1;
		var ym = yc - s1;
		var xp = xc + s1;
		var yp = yc + s1;
		if(0 < xp || xm < ccvs.width || 0 < yp || ym < ccvs.height){
			// 描画範囲の記憶
			if(this._character.minx > xm){this._character.minx = xm;}
			if(this._character.miny > ym){this._character.miny = ym;}
			if(this._character.maxx < xp){this._character.maxx = xp;}
			if(this._character.maxy < yp){this._character.maxy = yp;}
			// 描画
			if(this._yswap || this._zswap){
				ccvs.context.save();
				ccvs.context.translate(xc, yc);
				ccvs.context.scale(this._yswap ? -1 : 1, this._zswap ? -1 : 1);
				ccvs.context.translate(-xc, -yc);
				ccvs.context.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, xm, ym, s2, s2);
				ccvs.context.restore();
			}else{
				ccvs.context.drawImage(this._character.canvas, this._dru, this._drv, this._uvsize, this._uvsize, xm, ym, s2, s2);
			}
		}
	}
}

// 武器とその軌跡クラス
class DrawCharacterWeapon extends DrawUnit{
	static var drawed : Map.<HTMLCanvasElement> = {} : Map.<HTMLCanvasElement>;

	var _character : DrawCharacter;
	var _canvas : HTMLCanvasElement = null;

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
		this._character.preDrawParts(ccvs, this, x1, y1, z1);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var ps = this._canvas.height * this._character.drScale;
		var px = this.drx + ccvs.width * 0.5;
		var py = this.dry + ccvs.height * 0.5;
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

	var _scale : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(scale : number){
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
		this._scale = scale;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number) : void{
		super.preDraw(ccvs, x, y, z, this._scale);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(ccvs : Ccvs) : void{
		var psx = (16 * this.drScale) as int;
		var psy = (psx * ccvs.sinh) as int;
		var px = (this.drx - psx * 0.5 + ccvs.width * 0.5) as int;
		var py = (this.dry - psy * 0.5 + ccvs.height * 0.5) as int;
		ccvs.context.drawImage(DrawShadow._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

