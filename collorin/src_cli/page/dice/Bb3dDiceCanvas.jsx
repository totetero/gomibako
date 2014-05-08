import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../../bb3d/Bb3dCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dDiceCanvas extends Bb3dCanvasFullscreen{
	// コンストラクタ
	function constructor(rotv : number, roth : number, scale : number){
		super(rotv, roth, scale);
	}

	// 計算
	function calc() : void{
	}

	// 描画
	function draw() : void{
		Ctrl.gctx.fillStyle = "yellow";
		Ctrl.gctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

