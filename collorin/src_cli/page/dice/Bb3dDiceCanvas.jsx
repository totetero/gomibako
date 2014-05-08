import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../../bb3d/Bb3dCanvas.jsx";
import "../../bb3d/Bb3dDrawCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dDiceCanvas extends Bb3dCanvasFullscreen{
	var _character : Bb3dDrawCharacter;

	// コンストラクタ
	function constructor(rotv : number, roth : number, scale : number){
		super(rotv, roth, scale);
		var img = Loader.imgs["img_character_player0_dot"];
		var mot = Loader.mots["mot_human"];
		this._character = new Bb3dDrawCharacter(img, mot, 1.0);
	}

	// 計算
	function calc() : void{
		// キャンバス計算
		this.calcTouchCoordinate();
		this.calcTouchRotate();
		this.calcRotv(this.calcrotv, 0.2);
		this.calcRoth(Math.PI / 180 * 30, 0.1);
		this.scale -= (this.scale - 1.0) * 0.1;
		this.cx -= (this.cx - this.calcx) * 0.2;
		this.cy -= (this.cy - this.calcy) * 0.2;
	}

	// 描画
	function draw() : void{
		Ctrl.gctx.fillStyle = "yellow";
		Ctrl.gctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);
		this._character.preDraw(this, 0, 0, 0, Math.PI * 0.5, "stand", 0);
		this._character.draw(this);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

