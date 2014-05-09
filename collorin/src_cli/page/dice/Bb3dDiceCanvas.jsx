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

	// 背景
	var _bgimg : HTMLImageElement;
	var _bgaction = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(0, 0, 1);

		var img = Loader.imgs["img_character_player0_dot"];
		var mot = Loader.mots["mot_human"];
		this._character = new Bb3dDrawCharacter(img, mot, 1.0);

		// 背景
		this._bgimg = Loader.imgs["img_background_test"];
	}

	// ----------------------------------------------------------------
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

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 背景描画
		this._drawBackground();

		this._character.preDraw(this, 0, 0, 0, Math.PI * 0.5, "stand", 0);
		this._character.draw(this);
	}

	// ----------------------------------------------------------------
	// 背景描画
	function _drawBackground() : void{
		if(this._bgimg == null){return;}
		var width = this._bgimg.width * Ctrl.sh / this._bgimg.height;
		var x = -(this._bgaction++ % width);
		while(x < Ctrl.sw){
			Ctrl.gctx.drawImage(this._bgimg, x, 0, width, Ctrl.sh);
			x += width;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

