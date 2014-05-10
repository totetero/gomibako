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

// 影クラス
class Bb3dDrawShadow extends Bb3dDrawUnit{
	static var _canvas : HTMLCanvasElement = null;

	var _scale : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(scale : number){
		// 影画像作成
		if(Bb3dDrawShadow._canvas == null){
			Bb3dDrawShadow._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = Bb3dDrawShadow._canvas.getContext("2d") as CanvasRenderingContext2D;
			Bb3dDrawShadow._canvas.width = Bb3dDrawShadow._canvas.height = 32;
			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.arc(16, 16, 15, 0, Math.PI * 2.0, true);
			context.fill();
		}
		// 影の大きさ
		this._scale = scale;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dCanvas, x : number, y : number, z : number) : void{
		super.preDraw(bcvs, x, y, z, this._scale);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var psx = (16 * this.drScale) as int;
		var psy = (psx * bcvs.sinh) as int;
		var px = (this.drx - psx * 0.5 + bcvs.x + bcvs.w * 0.5) as int;
		var py = (this.dry - psy * 0.5 + bcvs.y + bcvs.h * 0.5) as int;
		Ctrl.gctx.drawImage(Bb3dDrawShadow._canvas, px, py, psx, psy);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

