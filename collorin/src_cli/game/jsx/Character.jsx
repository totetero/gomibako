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
	var duList : DrawUnit[];
	var drX : number;
	var drY : number;
	var drZ : number;
	var drScale : number;
	var drAngv1 : number;
	var drAngv2 : number;
	var drSin : number;
	var drCos : number;

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number, z : number, r : number, s : number) : void{
		this.visible = true;
		// 位置
		this.drX = Ccvs.scale * (x * Ccvs.cosv - y * Ccvs.sinv);
		this.drY = Ccvs.scale * (x * Ccvs.sinv + y * Ccvs.cosv);
		this.drZ = Ccvs.scale * z;
		this.drz = this.drY * Ccvs.cosh + this.drZ * Ccvs.sinh;
		this.drScale = Ccvs.scale * s;
		// 三角関数
		this.drSin = Math.sin(Ccvs.rotv + r);
		this.drCos = Math.cos(Ccvs.rotv + r);
		// テクスチャ垂直軸角度フレーム
		var v = 45 + 180 / Math.PI * (-Ccvs.rotv - r);
		while(v  > 360){v  -= 360;} while(v  <= 0){v  += 360;}
		if(v  < 90){this.drAngv1 = 1;}else if(v  <= 180){this.drAngv1 = 2;}else if(v  < 270){this.drAngv1 = 3;}else{this.drAngv1 = 0;}
		// テクスチャ垂直軸角度フレーム タイヤ用
		var v = 22.5 + 180 / Math.PI * (-Ccvs.rotv - r);
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
	// 部分描画関数
	function setParts(p : DrawCharacterParts, x: number, y: number, z: number, type : int) : void{
		// 位置等設定
		p.visible = true;
		p.drx = this.drX + this.drScale * 35 * (x * this.drCos - y * this.drSin);
		var y0 = this.drY + this.drScale * 35 * (x * this.drSin + y * this.drCos);
		var z0 = this.drZ + this.drScale * 35 * (z - 0.05);
		p.dry = y0 * Ccvs.sinh - z0 * Ccvs.cosh;
		p.drz = y0 * Ccvs.cosh + z0 * Ccvs.sinh;
		p.drScale = this.drScale;

		var av = 0;
		switch(type){
			case 1: case 2: case 3: case 4: av = this.drAngv1; break;
			case 5: av = this.drAngv2; break;
		}

		// 反転の確認
		p.yswap = false;
		// 上下反転
		p.zswap = (type == 3 || type == 4);
		// 前後反転
		if(type == 2 || type == 3){
			if(av == 0){av = 2;}else if(av == 2){av = 0;}
			p.yswap = !p.yswap;
		}
		// 左右反転
		if(p.swap){
			if(av == 1){av = 3;}else if(av == 3){av = 1;}
			p.yswap = !p.yswap;
		}

		// 視点を考慮したuv座標設定
		p.u = p.u0 + av * p.size;
		p.v = p.v0;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		DrawUnit.drawList(this.duList);
	}
}

// 体のパーツクラス
class DrawCharacterParts extends DrawUnit{
	var img : HTMLImageElement;
	var drx : number;
	var dry : number;
	var drScale : number;
	var u : int;
	var v : int;
	var u0 : int;
	var v0 : int;
	var size : int;
	var swap : boolean;
	var yswap : boolean;
	var zswap : boolean;
	// コンストラクタ
	function constructor(u0 : int, v0 : int, size : int, swap : boolean){
		this.u0 = u0;
		this.v0 = v0;
		this.size = size;
		this.swap = swap;
	}
	// 描画
	override function draw() : void{
		var ps = (this.size * this.drScale) as int;
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
			Ccvs.context.drawImage(this.img, this.u, this.v, this.size, this.size, px, py, ps, ps);
			Ccvs.context.restore();
		}else{
			Ccvs.context.drawImage(this.img, this.u, this.v, this.size, this.size, px, py, ps, ps);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class DrawPlayer extends DrawCharacter{
	var parts_head = new DrawCharacterParts( 0,  0, 16, false);
	var parts_body = new DrawCharacterParts( 0, 16, 16, false);
	var parts_ftr1 = new DrawCharacterParts( 0, 32,  8, false);
	var parts_ftl1 = new DrawCharacterParts( 0, 32,  8, true);
	var parts_ftr2 = new DrawCharacterParts(32, 32,  8, false);
	var parts_ftl2 = new DrawCharacterParts(32, 32,  8, true);
	var parts_hndr = new DrawCharacterParts( 0, 40,  8, false);
	var parts_hndl = new DrawCharacterParts( 0, 40,  8, true);
	var parts_hair = new DrawCharacterParts( 0, 48, 16, false);
	var parts_hail = new DrawCharacterParts( 0, 48, 16, true);
	var parts_tail = new DrawCharacterParts( 0, 64, 16, false);

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(img : HTMLImageElement){
		this.duList = new DrawUnit[];
		this.duList.push(this.parts_head);
		this.duList.push(this.parts_body);
		this.duList.push(this.parts_ftr1);
		this.duList.push(this.parts_ftl1);
		this.duList.push(this.parts_ftr2);
		this.duList.push(this.parts_ftl2);
		this.duList.push(this.parts_hndr);
		this.duList.push(this.parts_hndl);
		this.duList.push(this.parts_hair);
		this.duList.push(this.parts_hail);
		this.duList.push(this.parts_tail);
		for(var i = 0; i < this.duList.length; i++){(this.duList[i] as DrawCharacterParts).img = img;}
	}

	// ----------------------------------------------------------------
	// 姿勢関数
	function setPose(action : int) : void{
		if(action > 0){
			// 移動
			switch(((action / 6) as int) % 4){
				case 0:
					this.setParts(this.parts_head,  0.12,  0.00, 0.45, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.23, 1);
					this.setParts(this.parts_ftr1,  0.10,  0.07, 0.10, 1);
					this.setParts(this.parts_ftl2, -0.20, -0.07, 0.20, 1);
					this.setParts(this.parts_hndr, -0.10,  0.15, 0.25, 0);
					this.setParts(this.parts_hndl,  0.10, -0.15, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.43, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.43, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.36, 1);break;
				case 1:
					this.setParts(this.parts_head,  0.12,  0.00, 0.47, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.26, 1);
					this.setParts(this.parts_ftr1,  0.00,  0.07, 0.10, 1);
					this.setParts(this.parts_ftl1,  0.00, -0.07, 0.15, 1);
					this.setParts(this.parts_hndr, -0.05,  0.18, 0.25, 0);
					this.setParts(this.parts_hndl,  0.05, -0.18, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.45, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.45, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.38, 1);break;
				case 2:
					this.setParts(this.parts_head,  0.12,  0.00, 0.45, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.23, 1);
					this.setParts(this.parts_ftr2, -0.20,  0.07, 0.20, 1);
					this.setParts(this.parts_ftl1,  0.10, -0.07, 0.10, 1);
					this.setParts(this.parts_hndr,  0.10,  0.15, 0.25, 0);
					this.setParts(this.parts_hndl, -0.10, -0.15, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.43, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.43, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.36, 1);break;
				case 3:
					this.setParts(this.parts_head,  0.12,  0.00, 0.47, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.26, 1);
					this.setParts(this.parts_ftr1,  0.00,  0.07, 0.15, 1);
					this.setParts(this.parts_ftl1,  0.00, -0.07, 0.10, 1);
					this.setParts(this.parts_hndr,  0.05,  0.18, 0.25, 0);
					this.setParts(this.parts_hndl, -0.05, -0.18, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.45, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.45, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.38, 1);break;
			}
		}else{
			// 静止
			this.setParts(this.parts_head,  0.00,  0.00, 0.52, 1);
			this.setParts(this.parts_body, -0.02,  0.00, 0.27, 1);
			this.setParts(this.parts_ftr1,  0.02,  0.10, 0.10, 1);
			this.setParts(this.parts_ftl1, -0.02, -0.10, 0.10, 1);
			this.setParts(this.parts_hndr, -0.02,  0.20, 0.25, 0);
			this.setParts(this.parts_hndl,  0.02, -0.20, 0.25, 0);
			this.setParts(this.parts_hair, -0.05,  0.20, 0.50, 1);
			this.setParts(this.parts_hail, -0.05, -0.20, 0.50, 1);
			this.setParts(this.parts_tail, -0.15,  0.00, 0.40, 1);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

