import 'js/web.jsx';

import "Ccvs.jsx";
import "DrawUnit.jsx";

// Bb3d (billboard base 3d graphic library)
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
class DrawText extends DrawUnit{
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

