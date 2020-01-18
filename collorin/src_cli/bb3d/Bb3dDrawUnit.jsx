import 'js/web.jsx';

import "../util/Ctrl.jsx";
import "../util/Sound.jsx";
import "../util/Drawer.jsx";
import "../util/Loader.jsx";
import "../util/Loading.jsx";
import "../util/EventCartridge.jsx";

import "Bb3dCanvas.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画単位
abstract class Bb3dDrawUnit{
	// リストの除外とソートと描画
	static function drawList(bcvs : Bb3dCanvas, list : Bb3dDrawUnit[]) : void{
		for(var i = 0; i < list.length; i++){if(!list[i].exist){list.splice(i--,1);}}
		list.sort(function(u0 : Nullable.<Bb3dDrawUnit>, u1 : Nullable.<Bb3dDrawUnit>):number{return u0.drz - u1.drz;});
		for(var i = 0; i < list.length; i++){if(list[i].visible){list[i].draw(bcvs); list[i].visible = false;}}
	}

	// ----------------------------------------------------------------

	var visible : boolean = false;
	var exist : boolean = true;
	var drx : number;
	var dry : number;
	var drz : number;
	// 描画準備
	function preDraw(bcvs : Bb3dCanvas, x : number, y : number, z : number) : void{
		this.visible = true;
		this.drx = bcvs.scale * (x * bcvs.cosv - y * bcvs.sinv);
		var y0 = bcvs.scale * (x * bcvs.sinv + y * bcvs.cosv);
		var z0 = bcvs.scale * z;
		this.dry = y0 * bcvs.sinh - z0 * bcvs.cosh;
		this.drz = y0 * bcvs.cosh + z0 * bcvs.sinh;
	}
	// 描画
	abstract function draw(bcvs : Bb3dCanvas) : void;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

