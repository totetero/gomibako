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

// キャラクタークラス
class DrawCharacter extends DrawUnit{
	var _duList : DrawUnit[];
	var _parts : Map.<DrawCharacterParts[]>;
	var _pose : Map.<Map.<number[]>[]>;

	var _drX : number;
	var _drY : number;
	var _drZ : number;
	var _drScale : number;
	var _drAngv1 : number;
	var _drAngv2 : number;
	var _drSin : number;
	var _drCos : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(img : HTMLImageElement, parts : string, pose : string){
		// サンプル
		var parts = '{"head":[[0,0,0,0,0,16,0],[-0.06,0.20,-0.02,0,48,16,0],[-0.06,-0.20,-0.02,0,48,16,1],[-0.19,0,-0.09,0,64,16,0]],"body":[[0,0,0,0,16,16,0]],"ftr1":[[0,0,0,0,32,8,0]],"ftl1":[[0,0,0,0,32,8,1]],"ftr2":[[0,0,0,32,32,8,0]],"ftl2":[[0,0,0,32,32,8,1]],"hndr":[[0,0,0,0,40,8,0]],"hndl":[[0,0,0,0,40,8,1]]}';
		var pose = '{"stand":[{"head":[1,0.00,0.00,0.52],"body":[1,-0.02,0.00,0.27],"ftr1":[1,0.02,0.10,0.10],"ftl1":[1,-0.02,-0.10,0.10],"hndr":[0,-0.02,0.20,0.25],"hndl":[0,0.02,-0.20,0.25]}],"walk":[{"head":[1,0.12,0.00,0.45],"body":[1,0.00,0.00,0.23],"ftr1":[1,0.10,0.07,0.10],"ftl2":[1,-0.20,-0.07,0.20],"hndr":[0,-0.10,0.15,0.25],"hndl":[0,0.10,-0.15,0.25]},{"head":[1,0.12,0.00,0.47],"body":[1,0.00,0.00,0.26],"ftr1":[1,0.00,0.07,0.10],"ftl1":[1,0.00,-0.07,0.15],"hndr":[0,-0.05,0.18,0.25],"hndl":[0,0.05,-0.18,0.25]},{"head":[1,0.12,0.00,0.45],"body":[1,0.00,0.00,0.23],"ftr2":[1,-0.20,0.07,0.20],"ftl1":[1,0.10,-0.07,0.10],"hndr":[0,0.10,0.15,0.25],"hndl":[0,-0.10,-0.15,0.25]},{"head":[1,0.12,0.00,0.47],"body":[1,0.00,0.00,0.26],"ftr1":[1,0.00,0.07,0.15],"ftl1":[1,0.00,-0.07,0.10],"hndr":[0,0.05,0.18,0.25],"hndl":[0,-0.05,-0.18,0.25]}]}';

		this._duList = new DrawUnit[];
		this._parts = {} : Map.<DrawCharacterParts[]>;
		this._pose = JSON.parse(pose) as Map.<Map.<number[]>[]>;
		var dat = JSON.parse(parts) as Map.<number[][]>;

		// パーツの登録
		for(var i in dat){
			this._parts[i] = new DrawCharacterParts[];
			for(var j = 0; j < dat[i].length; j++){
				var temp = dat[i][j];
				var x = temp[0];
				var y = temp[1];
				var z = temp[2];
				var u = Math.round(temp[3]);
				var v = Math.round(temp[4]);
				var s = Math.round(temp[5]);
				var swap = (Math.round(temp[6]) > 0);
				this._parts[i][j] = new DrawCharacterParts(img, x, y, z, u, v, s, swap);
				this._duList.push(this._parts[i][j]);
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number, z : number, r : number, s : number) : void{
		this.visible = true;
		// 位置
		this._drX = Ccvs.scale * (x * Ccvs.cosv - y * Ccvs.sinv);
		this._drY = Ccvs.scale * (x * Ccvs.sinv + y * Ccvs.cosv);
		this._drZ = Ccvs.scale * z;
		this.drz = this._drY * Ccvs.cosh + this._drZ * Ccvs.sinh;
		this._drScale = Ccvs.scale * s;
		// 三角関数
		this._drSin = Math.sin(Ccvs.rotv + r);
		this._drCos = Math.cos(Ccvs.rotv + r);
		// テクスチャ垂直軸角度フレーム
		var v = 45 + 180 / Math.PI * (-Ccvs.rotv - r);
		while(v  > 360){v  -= 360;} while(v  <= 0){v  += 360;}
		if(v  < 90){this._drAngv1 = 1;}else if(v  <= 180){this._drAngv1 = 2;}else if(v  < 270){this._drAngv1 = 3;}else{this._drAngv1 = 0;}
		// テクスチャ垂直軸角度フレーム タイヤ用
		var v = 22.5 + 180 / Math.PI * (-Ccvs.rotv - r);
		while(v > 360){v -= 360;} while(v  <= 0){v  += 360;}
		if(v < 45){this._drAngv2 = 2;}
		else if(v < 90){this._drAngv2 = 1;}
		else if(v < 135){this._drAngv2 = 0;}
		else if(v < 180){this._drAngv2 = 3;}
		else if(v < 225){this._drAngv2 = 2;}
		else if(v < 270){this._drAngv2 = 1;}
		else if(v < 315){this._drAngv2 = 0;}
		else{this._drAngv2 = 3;}
	}

	// ----------------------------------------------------------------
	// 姿勢関数
	function setPose(motion : string, action : int) : void{
		// エラーチェック
		if(this._pose[motion] == null || this._pose[motion][action] == null){return;}

		// 姿勢の解釈
		var pose = this._pose[motion][action];
		for(var i in pose){
			for(var j in this._parts[i]){
				var p = this._parts[i][j];
				p.visible = true;

				var type = Math.round(pose[i][0]);

				// 回転の確認
				var av = 0;
				switch(type){
					case 1: case 2: case 3: case 4: av = this._drAngv1; break;
					case 5: av = this._drAngv2; break;
				}

				// 反転の確認
				var x0 = p.x0;
				var z0 = p.z0;
				p.yswap = false;
				p.zswap = false;
				// 上下反転
				if(type == 3 || type == 4){
					p.zswap = !p.zswap;
					z0 *= -1;
				}
				// 前後反転
				if(type == 2 || type == 3){
					if(av == 0){av = 2;}else if(av == 2){av = 0;}
					p.yswap = !p.yswap;
					x0 *= -1;
				}
				// 左右反転
				if(p.swap){
					if(av == 1){av = 3;}else if(av == 3){av = 1;}
					p.yswap = !p.yswap;
				}
				// ボディローカル座標に、反転を考慮したパーツローカル座標を足し合わせ
				var x = pose[i][1] + x0;
				var y = pose[i][2] + p.y0;
				var z = pose[i][3] + z0;

				// 位置等設定
				p.drx = this._drX + this._drScale * 35 * (x * this._drCos - y * this._drSin);
				var y0 = this._drY + this._drScale * 35 * (x * this._drSin + y * this._drCos);
				var z0 = this._drZ + this._drScale * 35 * (z - 0.05);
				p.dry = y0 * Ccvs.sinh - z0 * Ccvs.cosh;
				p.drz = y0 * Ccvs.cosh + z0 * Ccvs.sinh;
				p.drScale = this._drScale;

				// 視点を考慮したuv座標設定
				p.dru = p.u0 + av * p.uvsize;
				p.drv = p.v0;
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
	var _img : HTMLImageElement;
	// パーツローカル座標
	var x0 : number;
	var y0 : number;
	var z0 : number;
	// テクスチャ情報
	var u0 : int;
	var v0 : int;
	var uvsize : int;
	// 左右反転フラグ
	var swap : boolean;

	var drx : number;
	var dry : number;
	var dru : int;
	var drv : int;
	var drScale : number;
	var yswap : boolean;
	var zswap : boolean;

	// コンストラクタ
	function constructor(img : HTMLImageElement, x0 : number, y0 : number, z0 : number, u0 : int, v0 : int, uvsize : int, swap : boolean){
		this._img = img;
		this.x0 = x0;
		this.y0 = y0;
		this.z0 = z0;
		this.u0 = u0;
		this.v0 = v0;
		this.uvsize = uvsize;
		this.swap = swap;
	}

	// 描画
	override function draw() : void{
		var ps = (this.uvsize * this.drScale) as int;
		var px = (this.drx - ps * 0.5 + Ccvs.canvas.width * 0.5) as int;
		var py = (this.dry - ps * 0.5 + Ccvs.canvas.height * 0.5) as int;
		if(px + ps < 0 || px - ps > Ccvs.canvas.width || py + ps < 0 || py - ps > Ccvs.canvas.height){
		}else if(this.yswap || this.zswap){
			var rx = px + ps * 0.5;
			var ry = py + ps * 0.5;
			Ccvs.context.save();
			Ccvs.context.translate(rx, ry);
			Ccvs.context.scale(this.yswap ? -1 : 1, this.zswap ? -1 : 1);
			Ccvs.context.translate(-rx, -ry);
			Ccvs.context.drawImage(this._img, this.dru, this.drv, this.uvsize, this.uvsize, px, py, ps, ps);
			Ccvs.context.restore();
		}else{
			Ccvs.context.drawImage(this._img, this.dru, this.drv, this.uvsize, this.uvsize, px, py, ps, ps);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

