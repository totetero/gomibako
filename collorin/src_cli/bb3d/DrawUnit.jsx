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
	var drz : number;
	abstract function draw(ccvs : Ccvs) : void;
	static function drawList(ccvs : Ccvs, list : DrawUnit[]) : void{
		for(var i = 0; i < list.length; i++){if(!list[i].exist){list.splice(i--,1);}}
		list.sort(function(u0 : Nullable.<DrawUnit>, u1 : Nullable.<DrawUnit>):number{return u0.drz - u1.drz;});
		for(var i = 0; i < list.length; i++){if(list[i].visible){list[i].draw(ccvs); list[i].visible = false;}}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

