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
import "../../bb3d/Bb3dDrawShadow.jsx";
import "../core/data/DataChara.jsx";
import "Bb3dDiceCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class Bb3dDiceCharacter extends DataChara{
	var _character : Bb3dDrawCharacter;
	var _shadow : Bb3dDrawShadow;

	var side : string;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dDiceCanvas, response : variant){
		super(response);
		this.side = response["side"] as string;
		this.hp = 50;
		this.sp = 50;
		this.maxhp = 100;
		this.maxsp = 100;
		var hexx = response["x"] as int;
		var hexy = response["y"] as int;
		this.x = bcvs.field.calcHexCoordx(hexx, hexy);
		this.y = bcvs.field.calcHexCoordy(hexx, hexy);
		this.r = response["r"] as number;

		var img = Loader.imgs["img_chara_dot_" + this.code];
		var mot = Loader.mots["mot_" + response["drawInfo"] as string];
		var size = response["size"] as number;
		this._character = new Bb3dDrawCharacter(img, mot, size);
		this._shadow = new Bb3dDrawShadow(size);
		bcvs.clist.push(this._character);
		bcvs.slist.push(this._shadow);
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
	function calc(bcvs : Bb3dDiceCanvas) : void{
		if(this.dstList.length > 0){
			// ヘックス目的地に向かう
			var dx = bcvs.field.calcHexCoordx(this.dstList[0][0], this.dstList[0][1]);
			var dy = bcvs.field.calcHexCoordy(this.dstList[0][0], this.dstList[0][1]);
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = bcvs.skip ? 5.0 : 3.0;
			if(x * x + y * y < speed * speed){
				this.x = dx;
				this.y = dy;
				this.dstList.shift();
			}else{
				this.r = Math.atan2(y, x);
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
			this.motion = (this.dstList.length > 0) ? "walk" : "stand";
			this.action++;
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dDiceCanvas) : void{
		var x = this.x - bcvs.cx;
		var y = this.y - bcvs.cy;
		this._shadow.preDraw(bcvs, x, y, 0);
		switch(this.motion){
			case "walk": this._character.preDraw(bcvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			case "attack1":
				var act = this._character.getLen(this.motion) - Math.ceil((10 - this.action) / 1);
				if(act >= 0){this._character.preDraw(bcvs, x, y, 0, this.r, this.motion, act);}
				else{this._character.preDraw(bcvs, x, y, 0, this.r, "stand", 0);}
				break;
			case "attack2":
			case "damage":
				var act = Math.floor(this.action / 1);
				if(act < this._character.getLen(this.motion)){this._character.preDraw(bcvs, x, y, 0, this.r, this.motion, act);}
				else{this._character.preDraw(bcvs, x, y, 0, this.r, "stand", 0);}
				break;
			case "charge": this._character.preDraw(bcvs, x, y, 0, this.r, "charge", 0); break;
			case "beam": this._character.preDraw(bcvs, x, y, 0, this.r, "beam", 0); break;
			default: this._character.preDraw(bcvs, x, y, 0, this.r, "stand", 0); break;
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._shadow.exist = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

