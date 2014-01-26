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
		this.drX = Ctrl.scale * (x * Ctrl.cosv - y * Ctrl.sinv);
		this.drY = Ctrl.scale * (x * Ctrl.sinv + y * Ctrl.cosv);
		this.drZ = Ctrl.scale * z;
		this.drz = this.drY * Ctrl.cosh + this.drZ * Ctrl.sinh;
		this.drScale = Ctrl.scale * s;
		// 三角関数
		this.drSin = Math.sin(Ctrl.rotv + r);
		this.drCos = Math.cos(Ctrl.rotv + r);
		// テクスチャ垂直軸角度フレーム
		var v = 45 + 180 / Math.PI * (-Ctrl.rotv - r);
		while(v  > 360){v  -= 360;} while(v  <= 0){v  += 360;}
		if(v  < 90){this.drAngv1 = 1;}else if(v  <= 180){this.drAngv1 = 2;}else if(v  < 270){this.drAngv1 = 3;}else{this.drAngv1 = 0;}
		// テクスチャ垂直軸角度フレーム タイヤ用
		var v = 22.5 + 180 / Math.PI * (-Ctrl.rotv - r);
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
		p.dry = y0 * Ctrl.sinh - z0 * Ctrl.cosh;
		p.drz = y0 * Ctrl.cosh + z0 * Ctrl.sinh;
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
		var px = (this.drx - ps * 0.5 + Ctrl.canvas.width * 0.5) as int;
		var py = (this.dry - ps * 0.5 + Ctrl.canvas.height * 0.5) as int;
		if(px + ps < 0 || px - ps > Ctrl.canvas.width || py + ps < 0 || py - ps > Ctrl.canvas.height){
		}else if(this.yswap || this.zswap){
			var rx = px + ps * 0.5;
			var ry = py + ps * 0.5;
			Ctrl.context.save();
			Ctrl.context.translate(rx, ry);
			Ctrl.context.scale(this.yswap ? -1 : 1, this.zswap ? -1 : 1);
			Ctrl.context.translate(-rx, -ry);
			Ctrl.context.drawImage(this.img, this.u, this.v, this.size, this.size, px, py, ps, ps);
			Ctrl.context.restore();
		}else{
			Ctrl.context.drawImage(this.img, this.u, this.v, this.size, this.size, px, py, ps, ps);
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
	var parts_pony = new DrawCharacterParts( 0, 80, 16, false);

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
		this.duList.push(this.parts_pony);
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
					this.setParts(this.parts_tail, -0.07,  0.00, 0.36, 1);
					this.setParts(this.parts_pony, -0.04, -0.02, 0.53, 1);break;
				case 1:
					this.setParts(this.parts_head,  0.12,  0.00, 0.47, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.26, 1);
					this.setParts(this.parts_ftr1,  0.00,  0.07, 0.10, 1);
					this.setParts(this.parts_ftl1,  0.00, -0.07, 0.15, 1);
					this.setParts(this.parts_hndr, -0.05,  0.18, 0.25, 0);
					this.setParts(this.parts_hndl,  0.05, -0.18, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.45, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.45, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.38, 1);
					this.setParts(this.parts_pony, -0.04,  0.00, 0.55, 1);break;
				case 2:
					this.setParts(this.parts_head,  0.12,  0.00, 0.45, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.23, 1);
					this.setParts(this.parts_ftr2, -0.20,  0.07, 0.20, 1);
					this.setParts(this.parts_ftl1,  0.10, -0.07, 0.10, 1);
					this.setParts(this.parts_hndr,  0.10,  0.15, 0.25, 0);
					this.setParts(this.parts_hndl, -0.10, -0.15, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.43, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.43, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.36, 1);
					this.setParts(this.parts_pony, -0.04,  0.02, 0.53, 1);break;
				case 3:
					this.setParts(this.parts_head,  0.12,  0.00, 0.47, 1);
					this.setParts(this.parts_body,  0.00,  0.00, 0.26, 1);
					this.setParts(this.parts_ftr1,  0.00,  0.07, 0.15, 1);
					this.setParts(this.parts_ftl1,  0.00, -0.07, 0.10, 1);
					this.setParts(this.parts_hndr,  0.05,  0.18, 0.25, 0);
					this.setParts(this.parts_hndl, -0.05, -0.18, 0.25, 0);
					this.setParts(this.parts_hair,  0.06,  0.20, 0.45, 1);
					this.setParts(this.parts_hail,  0.06, -0.20, 0.45, 1);
					this.setParts(this.parts_tail, -0.07,  0.00, 0.38, 1);
					this.setParts(this.parts_pony, -0.04,  0.00, 0.55, 1);break;
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
			this.setParts(this.parts_pony, -0.16,  0.00, 0.60, 1);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 吹き出しクラス
class DrawBalloon extends DrawUnit{
	var canvas : HTMLCanvasElement = null;
	var context : CanvasRenderingContext2D;
	var drx : number;
	var dry : number;
	var drScale : number;
	var action : int;
	var time : int;

	// ----------------------------------------------------------------
	// 文字列設定
	function setText(txt : string, time : int) : void{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(txt.length > 0){
			var size = 24;
			this.context.font = size as string + "px 'monospace'";
			var measure = this.context.measureText(txt);

			this.context.fillStyle = "rgba(255, 255, 255, 0.8)";
			var w = measure.width + 20;
			var h = size + 20;
			var l = (this.canvas.width - w) * 0.5;
			var t = this.canvas.height - h - 15;
			var r = 10;
			this.context.beginPath();
			this.context.arc(l +     r, t +     r, r, -Math.PI, -0.5 * Math.PI, false);
			this.context.arc(l + w - r, t +     r, r, -0.5 * Math.PI, 0, false);
			this.context.arc(l + w - r, t + h - r, r, 0, 0.5 * Math.PI, false);
			this.context.lineTo(this.canvas.width * 0.5 + 8, this.canvas.height - 15);
			this.context.lineTo(this.canvas.width * 0.5 + 0, this.canvas.height );
			this.context.lineTo(this.canvas.width * 0.5 - 8, this.canvas.height - 15);
			this.context.arc(l +     r, t + h - r, r, 0.5 * Math.PI, Math.PI, false);
			this.context.closePath();
			this.context.stroke();
			this.context.fill();

			this.context.fillStyle = "black";
			this.context.fillText(txt, this.canvas.width * 0.5, this.canvas.height - size * 0.5 - 10 - 15);

			this.action = 0;
			this.time = time;
		}
	}

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.canvas.width = 512;
		this.canvas.height = 64;
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.action = 0;
		this.time = 0;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number, z : number, s : number) : void{
		if(this.action++ < this.time || this.time < 0){
			this.visible = true;
			// 位置
			this.drx = Ctrl.scale * (x * Ctrl.cosv - y * Ctrl.sinv);
			var y0 = Ctrl.scale * (x * Ctrl.sinv + y * Ctrl.cosv);
			var z0 = Ctrl.scale * z;
			this.drScale = Ctrl.scale * s;
			var z1 = z0;
			this.dry = y0 * Ctrl.sinh - z1 * Ctrl.cosh;
			this.drz = y0 * Ctrl.cosh + z0 * Ctrl.sinh;
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var psx = (this.canvas.width * 0.5 * this.drScale) as int;
		var psy = (this.canvas.height * 0.5 * this.drScale) as int;

		if(this.action < 10){
			var size = 0.2 * Math.sin(Math.PI * 2 * this.action / 10);
			psx *= 1 + size;
			psy *= 1 - size;
		}
		
		var px = (this.drx - psx * 0.5 + Ctrl.canvas.width * 0.5) as int;
		var py = (this.dry - psy * 1.0 + Ctrl.canvas.height * 0.5) as int;
		Ctrl.context.drawImage(this.canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

