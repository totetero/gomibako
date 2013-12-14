import 'js/web.jsx';

import "Ctrl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画単位
abstract class DrawUnit{
	var visible : boolean = false;
	var exist : boolean = true;
	var drz : number;
	abstract function draw() : void;
	static function drawList(list : DrawUnit[]) : void{
		for(var i = 0; i < list.length; i++){if(!list[i].exist){list.splice(i--,1);}}
		list.sort(function(u0 : Nullable.<DrawUnit>, u1 : Nullable.<DrawUnit>):number{return u0.drz - u1.drz;});
		for(var i = 0; i < list.length; i++){if(list[i].visible){list[i].draw(); list[i].visible = false;}}
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
	var _duList : DrawUnit[];
	var _parts : Map.<DrawCharacterParts[]>;
	var _pose : Map.<Map.<number[]>[]>;
	var _weapon : DrawCharacterWeapon;

	// パーツ描画用変数
	var img : HTMLImageElement;
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
	function constructor(img : HTMLImageElement, drawInfo : DrawInfo){
		this.img = img;
		this._duList = new DrawUnit[];
		this._parts = {} : Map.<DrawCharacterParts[]>;
		this._pose = drawInfo.pose;

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
	// 描画準備
	function preDraw(x : number, y : number, z : number, r : number, s : number) : void{
		this.visible = true;
		// 位置
		this.drX0 = Ccvs.scale * (x * Ccvs.cosv - y * Ccvs.sinv);
		this.drY0 = Ccvs.scale * (x * Ccvs.sinv + y * Ccvs.cosv);
		this.drZ0 = Ccvs.scale * z;
		this.drz = this.drY0 * Ccvs.cosh + this.drZ0 * Ccvs.sinh;
		this.drScale = Ccvs.scale * s;
		// 角度と三角関数
		this.drRotv = Ccvs.rotv + r;
		this.drSin = Math.sin(this.drRotv);
		this.drCos = Math.cos(this.drRotv);
		// テクスチャ垂直軸角度フレーム
		var v = 45 + 180 / Math.PI * (-this.drRotv);
		while(v  > 360){v  -= 360;} while(v  <= 0){v  += 360;}
		if(v  < 90){this.drAngv1 = 1;}else if(v  <= 180){this.drAngv1 = 2;}else if(v  < 270){this.drAngv1 = 3;}else{this.drAngv1 = 0;}
		// テクスチャ垂直軸角度フレーム タイヤ用
		var v = 22.5 + 180 / Math.PI * (-this.drRotv);
		while(v > 360){v -= 360;} while(v  <= 0){v  += 360;}
		if(v < 45){this.drAngv2 = 2;}
		else if(v < 90){this.drAngv2 = 1;}
		else if(v < 135){this.drAngv2 = 0;}
		else if(v < 180){this.drAngv2 = 3;}
		else if(v < 225){this.drAngv2 = 2;}
		else if(v < 270){this.drAngv2 = 1;}
		else if(v < 315){this.drAngv2 = 0;}
		else{this.drAngv2 = 3;}
	}

	// ----------------------------------------------------------------
	// 姿勢関数
	function setPose(motion : string, action : int) : void{
		// エラーチェック
		if(this._pose[motion] == null || this._pose[motion][action] == null){return;}

		// 姿勢の解釈
		var pose = this._pose[motion][action];
		for(var i in pose){
			if(i == "weapon"){
				// 特殊パーツ 武器
				this._weapon.preDraw(pose[i]);
			}else{
				// 体のパーツ
				for(var j in this._parts[i]){
					this._parts[i][j].preDraw(pose[i]);
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		DrawUnit.drawList(this._duList);
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
	function preDraw(pose : number[]) : void{
		this.visible = true;
		var type = Math.round(pose[0]);

		// 回転の確認
		var av = 0;
		switch(type){
			case 1: case 2: case 3: case 4: av = this._character.drAngv1; break;
			case 5: av = this._character.drAngv2; break;
		}

		// パーツローカル座標の反転確認
		var x2 = this._x2;
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

		// ボディローカル座標
		var x1 = pose[1] + x2;
		var y1 = pose[2] + this._y2;
		var z1 = pose[3] + z2;

		// 描画位置等設定
		this._drx = this._character.drX0 + this._character.drScale * 35 * (x1 * this._character.drCos - y1 * this._character.drSin);
		var y0 = this._character.drY0 + this._character.drScale * 35 * (x1 * this._character.drSin + y1 * this._character.drCos);
		var z0 = this._character.drZ0 + this._character.drScale * 35 * (z1 - 0.05);
		this._dry = y0 * Ccvs.sinh - z0 * Ccvs.cosh;
		this.drz = y0 * Ccvs.cosh + z0 * Ccvs.sinh;

		// 視点を考慮したuv座標設定
		this._dru = this._u + av * this._uvsize;
		this._drv = this._v;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var ps = (this._uvsize * this._character.drScale) as int;
		var px = (this._drx - ps * 0.5 + Ccvs.canvas.width * 0.5) as int;
		var py = (this._dry - ps * 0.5 + Ccvs.canvas.height * 0.5) as int;
		if(px + ps < 0 || px - ps > Ccvs.canvas.width || py + ps < 0 || py - ps > Ccvs.canvas.height){
		}else if(this._yswap || this._zswap){
			var rx = px + ps * 0.5;
			var ry = py + ps * 0.5;
			Ccvs.context.save();
			Ccvs.context.translate(rx, ry);
			Ccvs.context.scale(this._yswap ? -1 : 1, this._zswap ? -1 : 1);
			Ccvs.context.translate(-rx, -ry);
			Ccvs.context.drawImage(this._character.img, this._dru, this._drv, this._uvsize, this._uvsize, px, py, ps, ps);
			Ccvs.context.restore();
		}else{
			Ccvs.context.drawImage(this._character.img, this._dru, this._drv, this._uvsize, this._uvsize, px, py, ps, ps);
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
	var _action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(character : DrawCharacter, weapon : string){
		this._character = character;

		if(DrawCharacterWeapon.drawed[weapon] == null){
			// 武器画像作成
			this._canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
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
	function preDraw(pose : number[]) : void{
		this.visible = true;
		this._action = Math.round(pose[0]);

		// ボディローカル座標
		var x1 = pose[1];
		var y1 = pose[2];
		var z1 = pose[3];

		// 描画位置等設定
		this._drx = this._character.drX0 + this._character.drScale * 35 * (x1 * this._character.drCos - y1 * this._character.drSin);
		var y0 = this._character.drY0 + this._character.drScale * 35 * (x1 * this._character.drSin + y1 * this._character.drCos);
		var z0 = this._character.drZ0 + this._character.drScale * 35 * (z1 - 0.05);
		this._dry = y0 * Ccvs.sinh - z0 * Ccvs.cosh;
		this.drz = y0 * Ccvs.cosh + z0 * Ccvs.sinh;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var ps = this._canvas.height * this._character.drScale;
		var px = this._drx + Ccvs.canvas.width * 0.5;
		var py = this._dry + Ccvs.canvas.height * 0.5;
		Ccvs.context.save();
		Ccvs.context.translate(px, py);
		Ccvs.context.scale(1, Ccvs.sinh);
		Ccvs.context.rotate(this._character.drRotv);
		Ccvs.context.translate(ps * -0.5, ps * -0.5);
		Ccvs.context.drawImage(this._canvas, this._canvas.height * this._action, 0, this._canvas.height, this._canvas.height, 0, 0, ps, ps);
		Ccvs.context.restore();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 影クラス

class DrawShadow extends DrawUnit{
	static var canvas : HTMLCanvasElement = null;
	var drx : number;
	var dry : number;
	var drScale : number;
	
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// 影画像作成
		if(DrawShadow.canvas == null){
			DrawShadow.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
			var context = DrawShadow.canvas.getContext("2d") as CanvasRenderingContext2D;
			DrawShadow.canvas.width = DrawShadow.canvas.height = 32;
			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.arc(16, 16, 15, 0, Math.PI * 2.0, true);
			context.fill();
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number, z : number, s : number) : void{
		this.visible = true;
		// 位置
		this.drx = Ccvs.scale * (x * Ccvs.cosv - y * Ccvs.sinv);
		var y0 = Ccvs.scale * (x * Ccvs.sinv + y * Ccvs.cosv);
		var z0 = Ccvs.scale * z;
		this.dry = y0 * Ccvs.sinh - z0 * Ccvs.cosh;
		this.drz = y0 * Ccvs.cosh + z0 * Ccvs.sinh;
		this.drScale = Ccvs.scale * s;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var psx = (16 * this.drScale) as int;
		var psy = (psx * Ccvs.sinh) as int;
		var px = (this.drx - psx * 0.5 + Ccvs.canvas.width * 0.5) as int;
		var py = (this.dry - psy * 0.5 + Ccvs.canvas.height * 0.5) as int;
		Ccvs.context.drawImage(DrawShadow.canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

