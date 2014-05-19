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
import "../../bb3d/Bb3dDrawText.jsx";
import "../core/data/DataChara.jsx";
import "Bb3dChatCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class Bb3dChatCharacter extends DataChara{
	var _character : Bb3dDrawCharacter;
	var _nametag : Bb3dDrawText;
	var _balloon : Bb3dDrawBalloon;
	var _shadow : Bb3dDrawShadow;

	var uid : string;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dChatCanvas, response : variant){
		super(response);
		this.uid = response["uid"] as string;
		this.x = response["x"] as int * 16 + 8;
		this.y = response["y"] as int * 16 + 8;
		this.r = response["r"] as int * Math.PI * 0.25;

		var img = Loader.imgs["img_chara_dot_" + this.code];
		var mot = Loader.mots["mot_" + response["drawInfo"] as string];
		var size = response["size"] as number;
		this._character = new Bb3dDrawCharacter(img, mot, size);
		this._nametag = new Bb3dDrawText(this.name);
		this._balloon = new Bb3dDrawBalloon();
		this._shadow = new Bb3dDrawShadow(size);
		bcvs.clist.push(this._character);
		bcvs.clist.push(this._nametag);
		bcvs.clist.push(this._balloon);
		bcvs.slist.push(this._shadow);
		this.setTalk(response["serif"] as string);
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
	// 会話設定
	function setTalk(message : string) : void{
		this._balloon.setText(message, -1);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(bcvs : Bb3dChatCanvas) : void{
		if(this.dstList.length > 0){
			// グリッド目的地に向かう
			var dx = this.dstList[0][0] * 16 + 8;
			var dy = this.dstList[0][1] * 16 + 8;
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = 3.0;
			if(x * x + y * y < speed * speed){
				this.x = dx;
				this.y = dy;
				if(this.dstList[0][2] >= 0){this.r = this.dstList[0][2] * Math.PI * 0.25;}
				this.dstList.shift();
			}else{
				this.r = Math.atan2(y, x);
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
			this.motion = (this.dstList.length > 0) ? "walk" : "stand";
			this.action++;
		}
		this._balloon.calc();
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(bcvs : Bb3dChatCanvas) : void{
		var x = this.x - bcvs.cx;
		var y = this.y - bcvs.cy;
		this._nametag.preDraw(bcvs, x, y, 40, 1.0);
		this._balloon.preDraw(bcvs, x, y, 50, 1.0);
		this._shadow.preDraw(bcvs, x, y, 0);
		switch(this.motion){
			case "walk": this._character.preDraw(bcvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			default: this._character.preDraw(bcvs, x, y, 0, this.r, "stand", 0); break;
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._nametag.exist = false;
		this._balloon.exist = false;
		this._shadow.exist = false;	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

