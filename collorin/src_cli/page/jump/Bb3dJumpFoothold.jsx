import 'js/web.jsx';

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../../bb3d/Bb3dCanvas.jsx";
import "../../bb3d/Bb3dDrawUnit.jsx";
import "Bb3dJumpCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 足場クラス
class Bb3dJumpFoothold extends Bb3dDrawUnit{
	var _img : HTMLImageElement;
	var _x : number = 0;
	var _y : number = 0;
	var _z : number = 0;
	var _action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dJumpCanvas){
		this._img = Loader.imgs["img_foothold_test"];
		//bcvs.clist.push(this);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(bcvs : Bb3dJumpCanvas) : void{
		this._action++;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dJumpCanvas) : void{
		super.preDraw(bcvs, this._x, this._y, this._z);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw(bcvs : Bb3dCanvas) : void{
		var ps = (64 * bcvs.scale) as int;
		var px = (this.drx - ps * 0.50 + bcvs.x + bcvs.centerx) as int;
		var py = (this.dry - ps * 0.25 + bcvs.y + bcvs.centery) as int;
		Ctrl.gctx.drawImage(this._img, 256 * (Math.floor(this._action / 10) % 4), 0, 256, 256, px, py, ps, ps);
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

