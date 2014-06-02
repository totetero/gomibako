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

import "Bb3dJumpCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 足場クラス
class Bb3dJumpFoothold{
	var _img : HTMLImageElement;
	var x : number = 0;
	var y : number = 0;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dJumpCanvas){
		this._img = Loader.imgs["img_foothold_test"];
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(bcvs : Bb3dJumpCanvas) : void{
		this.action++;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(bcvs : Bb3dJumpCanvas) : void{
		var ps = (64 * bcvs.scale) as int;
		var px = ( this.x * bcvs.scale - ps * 0.50 + bcvs.x + bcvs.centerx) as int;
		var py = (-this.y * bcvs.scale - ps * 0.25 + bcvs.y + bcvs.centery) as int;
		Ctrl.gctx.drawImage(this._img, 256 * (Math.floor(this.action / 10) % 2), 0, 256, 256, px, py, ps, ps);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

