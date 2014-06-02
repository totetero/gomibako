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

import "../../bb3d/Bb3dDrawCharacter.jsx";
import "../../bb3d/Bb3dDrawText.jsx";
import "../core/data/chara/DataChara.jsx";
import "Bb3dJumpCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class Bb3dJumpCharacter extends DataChara{
	var _character : Bb3dDrawCharacter;
	var _nametag : Bb3dDrawText;

	var exist = true;
	var x : number = 100;
	var y : number = 100;
	var motion : string;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dJumpCanvas, response : variant){
		super(response);

		var img = Loader.imgs["img_chara_dot_" + this.code];
		var mot = Loader.mots["mot_" + response["motion"] as string];
		var size = response["size"] as number;
		this._character = new Bb3dDrawCharacter(img, mot, size);
		this._nametag = new Bb3dDrawText(this.name);
		bcvs.clist.push(this._character);
		bcvs.clist.push(this._nametag);
	}

	// ----------------------------------------------------------------
	// 範囲内の確認
	function isOver(x : int, y : int) : boolean{
		return this._character.minx < x && x < this._character.maxx && this._character.miny < y && y < this._character.maxy;
	}

	// ----------------------------------------------------------------
	// 表示深度獲得
	function getDepth() : number{
		return this._character.drz;
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		this._character.setColor(color);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(bcvs : Bb3dJumpCanvas) : void{
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dJumpCanvas) : void{
		var x = this.x - bcvs.cx;
		var z = this.y / bcvs.cosh - bcvs.cy;
		var r = Math.PI * 0.5;
		this._nametag.preDraw(bcvs, x, 0, z + 40);
		switch(this.motion){
			case "walk": this._character.preDraw(bcvs, x, 0, z, r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			default: this._character.preDraw(bcvs, x, 0, z, r, "stand", 0); break;
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._nametag.exist = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

