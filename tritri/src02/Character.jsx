// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// キャラクタークラス

class Character{
	var img : HTMLImageElement;
	var x : number;
	var y : number;
	var z : number;
	var r : number = Math.PI * 0;
	var action : int = 0;
	var plist : Parts[] = new Parts[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init(img : HTMLImageElement, x : number, y : number) : void {
		this.img = img;
		for(var i = 0; i < 9; i++){this.plist[i] = new Parts();}
		this.x = x;
		this.y = y;
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {}
	
	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number, rotv : number) : void {
		// 位置
		var s : number = Math.sin(rotv);
		var c : number = Math.cos(rotv);
		this.ppx = Ctrl.w * 0.5 + (x * c - y * s) * 1.0;
		this.ppy = Ctrl.h * 0.5 + (x * s + y * c) * 0.5;
		this.z = this.ppy;
		// 角度
		this.pps = Math.sin(this.r + rotv);
		this.ppc = Math.cos(this.r + rotv);
		var r : number = 45 + 180 / Math.PI * -(this.r + rotv);
		while(r > 360){r -= 360;} while(r <= 0){r += 360;}
		if(r < 90){this.ppd = 1;}else if(r <= 180){this.ppd = 2;}else if(r < 270){this.ppd = 3;}else{this.ppd = 0;}
		// 姿勢
		this.setPose();
	}
	
	// パーツ登録関数
	var ppx : number;
	var ppy : number;
	var pps : number;
	var ppc : number;
	var ppd : int;
	function pushParts(p : Parts, type : int, x : number, y : number, z : number) : void{
		p.x = this.ppx + 35 * (x * this.ppc - y * this.pps);
		p.z =            35 * (x * this.pps + y * this.ppc);
		p.y = this.ppy - 35 * z + 2;
		switch(type){
			case 0: p.s = 16; p.u =  0 + this.ppd * p.s; p.v =  0; break;
			case 1: p.s = 16; p.u =  0 + this.ppd * p.s; p.v = 16; break;
			case 2: p.s =  8; p.u =  0 + this.ppd * p.s; p.v = 32; break;
			case 3: p.s =  8; p.u = 32 + this.ppd * p.s; p.v = 32; break;
			case 4: p.s =  8; p.u =  0                 ; p.v = 40; break;
			case 5: p.s = 16; p.u =  0 + this.ppd * p.s; p.v = 48; break;
			case 6: p.s = 16; p.u =  0 + this.ppd * p.s; p.v = 64; break;
		}
	}
	
	// 姿勢関数
	function setPose() : void{
		if(this.action > 0){
			switch(Math.floor(this.action / 6) % 4){
				case 0:
					this.pushParts(this.plist[0], 0,  0.12,  0.00, 0.45);
					this.pushParts(this.plist[1], 1,  0.00,  0.00, 0.23);
					this.pushParts(this.plist[2], 3, -0.20, -0.07, 0.20);
					this.pushParts(this.plist[3], 2,  0.10,  0.07, 0.10);
					this.pushParts(this.plist[4], 4,  0.10, -0.15, 0.25);
					this.pushParts(this.plist[5], 4, -0.10,  0.15, 0.25);
					this.pushParts(this.plist[6], 5,  0.06,  0.20, 0.43);
					this.pushParts(this.plist[7], 5,  0.06, -0.20, 0.43);
					this.pushParts(this.plist[8], 6, -0.07,  0.00, 0.36);break;
				case 1:
					this.pushParts(this.plist[0], 0,  0.12,  0.00, 0.47);
					this.pushParts(this.plist[1], 1,  0.00,  0.00, 0.26);
					this.pushParts(this.plist[2], 2, -0.00, -0.07, 0.15);
					this.pushParts(this.plist[3], 2,  0.00,  0.07, 0.10);
					this.pushParts(this.plist[4], 4,  0.05, -0.18, 0.25);
					this.pushParts(this.plist[5], 4, -0.05,  0.18, 0.25);
					this.pushParts(this.plist[6], 5,  0.06,  0.20, 0.45);
					this.pushParts(this.plist[7], 5,  0.06, -0.20, 0.45);
					this.pushParts(this.plist[8], 6, -0.07,  0.00, 0.38);break;
				case 2:
					this.pushParts(this.plist[0], 0,  0.12,  0.00, 0.45);
					this.pushParts(this.plist[1], 1,  0.00,  0.00, 0.23);
					this.pushParts(this.plist[2], 2,  0.10, -0.07, 0.10);
					this.pushParts(this.plist[3], 3, -0.20,  0.07, 0.20);
					this.pushParts(this.plist[4], 4, -0.10, -0.15, 0.25);
					this.pushParts(this.plist[5], 4,  0.10,  0.15, 0.25);
					this.pushParts(this.plist[6], 5,  0.06,  0.20, 0.43);
					this.pushParts(this.plist[7], 5,  0.06, -0.20, 0.43);
					this.pushParts(this.plist[8], 6, -0.07,  0.00, 0.36);break;
				case 3:
					this.pushParts(this.plist[0], 0,  0.12,  0.00, 0.47);
					this.pushParts(this.plist[1], 1,  0.00,  0.00, 0.26);
					this.pushParts(this.plist[2], 2,  0.00, -0.07, 0.10);
					this.pushParts(this.plist[3], 2, -0.00,  0.07, 0.15);
					this.pushParts(this.plist[4], 4, -0.05, -0.18, 0.25);
					this.pushParts(this.plist[5], 4,  0.05,  0.18, 0.25);
					this.pushParts(this.plist[6], 5,  0.06,  0.20, 0.45);
					this.pushParts(this.plist[7], 5,  0.06, -0.20, 0.45);
					this.pushParts(this.plist[8], 6, -0.07,  0.00, 0.38);break;
			}
		}else{
			this.pushParts(this.plist[0], 0,  0.00,  0.00, 0.52);
			this.pushParts(this.plist[1], 1, -0.02,  0.00, 0.27);
			this.pushParts(this.plist[2], 2, -0.02, -0.10, 0.10);
			this.pushParts(this.plist[3], 2,  0.02,  0.10, 0.10);
			this.pushParts(this.plist[4], 4,  0.02, -0.20, 0.25);
			this.pushParts(this.plist[5], 4, -0.02,  0.20, 0.25);
			this.pushParts(this.plist[6], 5, -0.05,  0.20, 0.50);
			this.pushParts(this.plist[7], 5, -0.05, -0.20, 0.50);
			this.pushParts(this.plist[8], 6, -0.15,  0.00, 0.40);
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D) : void {
		this.plist.sort(function(p0 : Nullable.<Parts>, p1 : Nullable.<Parts>) : number {return (p0.z - p1.z) * 1000;});
		for(var i = 0; i < this.plist.length; i++){
			var p : Parts = this.plist[i];
			var ps : int = p.s;
			var px : int = p.x - ps * 0.5;
			var py : int = p.y - ps * 0.5;
			context.drawImage(this.img, p.u, p.v, ps, ps, px, py, ps, ps);
		}
	}
}

// 体のパーツクラス
class Parts{
	var x : number;
	var y : number;
	var z : number;
	var u : int;
	var v : int;
	var s : int;
}

