import 'js/web.jsx';

import "Ccvs.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画単位
abstract class DrawUnit{
	var visible : boolean = false;
	var exist : boolean = true;
	var drx : number;
	var dry : number;
	var drz : number;
	var drScale : number;
	// 描画準備
	function preDraw(ccvs : Ccvs, x : number, y : number, z : number, s : number) : void{
		this.visible = true;
		this.drx = ccvs.scale * (x * ccvs.cosv - y * ccvs.sinv);
		var y0 = ccvs.scale * (x * ccvs.sinv + y * ccvs.cosv);
		var z0 = ccvs.scale * z;
		this.dry = y0 * ccvs.sinh - z0 * ccvs.cosh;
		this.drz = y0 * ccvs.cosh + z0 * ccvs.sinh;
		this.drScale = ccvs.scale * s;
	}
	// 描画
	abstract function draw(ccvs : Ccvs) : void;

	// リストの除外とソートと描画
	static function drawList(ccvs : Ccvs, list : DrawUnit[]) : void{
		for(var i = 0; i < list.length; i++){if(!list[i].exist){list.splice(i--,1);}}
		list.sort(function(u0 : Nullable.<DrawUnit>, u1 : Nullable.<DrawUnit>):number{return u0.drz - u1.drz;});
		for(var i = 0; i < list.length; i++){if(list[i].visible){list[i].draw(ccvs); list[i].visible = false;}}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

