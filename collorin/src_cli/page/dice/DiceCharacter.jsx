import "../../util/Loader.jsx";
import "../../bb3d/DrawCharacter.jsx";
import "../page/PartsCharacter.jsx";

import "DiceCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class DiceCharacter extends PartsCharacter{
	var _character : DrawCharacter;
	var _shadow : DrawShadow;

	var side : string;
	var hp : int;
	var sp : int;
	var maxhp : int;
	var maxsp : int;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : DiceCanvas, response : variant){
		super(response);
		this.side = response["side"] as string;
		this.hp = 100;
		this.sp = 100;
		this.maxhp = 100;
		this.maxsp = 100;
		var hexx = response["x"] as int;
		var hexy = response["y"] as int;
		this.x = ccvs.field.calcHexCoordx(hexx, hexy);
		this.y = ccvs.field.calcHexCoordy(hexx, hexy);
		this.r = response["r"] as number;

		var img = Loader.imgs["img_dot_" + this.code];
		var drawInfo = new DrawCharacterInfo(response["drawInfo"]);
		var size = response["size"] as number;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.slist.push(this._shadow);
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
	function calc(ccvs : DiceCanvas) : void{
		if(this.dstList.length > 0){
			// ヘックス目的地に向かう
			var dx = ccvs.field.calcHexCoordx(this.dstList[0][0], this.dstList[0][1]);
			var dy = ccvs.field.calcHexCoordy(this.dstList[0][0], this.dstList[0][1]);
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = 3.0;
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
	function preDraw(ccvs : DiceCanvas) : void{
		var x = this.x - ccvs.cx;
		var y = this.y - ccvs.cy;
		this._shadow.preDraw(ccvs, x, y, 0);
		switch(this.motion){
			case "walk": this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			case "attack1":
				var act = this._character.getLen(this.motion) - Math.ceil((10 - this.action) / 1);
				if(act >= 0){this._character.preDraw(ccvs, x, y, 0, this.r, this.motion, act);}
				else{this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);}
				break;
			case "attack2":
			case "damage":
				var act = Math.floor(this.action / 1);
				if(act < this._character.getLen(this.motion)){this._character.preDraw(ccvs, x, y, 0, this.r, this.motion, act);}
				else{this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);}
				break;
			default: this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0); break;
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

