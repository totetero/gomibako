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
import "Bb3dJumpFoothold.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class Bb3dJumpCharacter extends DataChara{
	var _character : Bb3dDrawCharacter;
	var _nametag : Bb3dDrawText;

	var _foothold : Bb3dJumpFoothold;

	var exist = true;
	var x : number = 0;
	var y : number = 0;
	var vx : number = 0;
	var vy : number = 0;
	var r : number = 0;
	var motion : string;
	var action : int;
	var active : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dJumpCanvas, response : variant, foothold : Bb3dJumpFoothold){
		super(response);
		this._foothold = foothold;

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
		if(!this.active && this != bcvs.player){return;}
		this.action++;

		if(this != bcvs.player){
			// 普通の落下状態
			this.vy -= 1;
			this.x += this.vx;
			this.y += this.vy;

			if(this.y < this._foothold.y - 100){this.active = false;}
		}else{
			// 操作可能状態
			this.x = this._foothold.x;
			this.y = this._foothold.y;
		}

		// ボーダーライン以下でのフェードアウト
		this._character.setAlpha(1 + (this.y - this._foothold.y) / 100);
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dJumpCanvas) : void{
		if(!this.active && this != bcvs.player){return;}
		var x = this.x - bcvs.cx;
		var z = this.y / bcvs.cosh - bcvs.cy;
		this._nametag.preDraw(bcvs, x, 0, z + 40);
		if(this != bcvs.player){
			// 普通の落下状態
			this._character.preDraw(bcvs, x, 0, z, this.r, this.vy > 0 ? "jump" : "fall", 0);
		}else{
			// 操作可能状態
			this._character.preDraw(bcvs, x, 0, z, this.r, this.active ? "squat" : "stand", 0);
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

