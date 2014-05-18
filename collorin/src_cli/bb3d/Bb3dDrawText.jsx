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

// 文字列クラス
class Bb3dDrawText extends Bb3dDrawUnit{
	var _canvas : HTMLCanvasElement = null;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(txt : string){
		// TODO Drawer使用
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
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var psx = (this._canvas.width * 0.5 * this.drScale) as int;
		var psy = (this._canvas.height * 0.5 * this.drScale) as int;
		var px = (this.drx - psx * 0.5 + bcvs.x + bcvs.w * 0.5) as int;
		var py = (this.dry - psy * 0.5 + bcvs.y + bcvs.h * 0.5) as int;
		Ctrl.gctx.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 吹き出しクラス
class Bb3dDrawBalloon extends Bb3dDrawUnit{
	var _canvas : HTMLCanvasElement = null;
	var _context : CanvasRenderingContext2D;

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

			// TODO Drawer使用
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
	// 計算
	function calc() : void{
		this._action++;
	}

	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(bcvs : Bb3dCanvas, x : number, y : number, z : number, s : number) : void{
		if(this._action <= this._time || this._time < 0){
			super.preDraw(bcvs, x, y, z, s);
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var psx = (this._canvas.width * 0.5 * this.drScale) as int;
		var psy = (this._canvas.height * 0.5 * this.drScale) as int;

		if(this._action < 10){
			var size = 0.2 * Math.sin(Math.PI * 2 * this._action / 10);
			psx *= 1 + size;
			psy *= 1 - size;
		}

		var px = (this.drx - psx * 0.5 + bcvs.x + bcvs.w * 0.5) as int;
		var py = (this.dry - psy * 1.0 + bcvs.y + bcvs.h * 0.5) as int;
		Ctrl.gctx.drawImage(this._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

