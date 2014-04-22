import "../../util/Loader.jsx";
import "../../bb3d/DrawCharacter.jsx";
import "../../bb3d/DrawText.jsx";
import "../core/PartsCharacter.jsx";

import "ChatCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class ChatCharacter extends PartsCharacter{
	var _character : DrawCharacter;
	var _nametag : DrawText;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;

	var uid : int;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, response : variant){
		super(response);
		this.uid = response["uid"] as int;
		this.x = response["x"] as int * 16 + 8;
		this.y = response["y"] as int * 16 + 8;
		this.r = response["r"] as int * Math.PI * 0.25;

		var img = Loader.imgs["img_chara_dot_" + this.code];
		var drawInfo = new DrawCharacterInfo(response["drawInfo"]);
		var size = response["size"] as number;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._nametag = new DrawText(this.name);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._nametag);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);
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
	function calc(ccvs : ChatCanvas) : void{
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
	function preDraw(ccvs : ChatCanvas) : void{
		var x = this.x - ccvs.cx;
		var y = this.y - ccvs.cy;
		this._nametag.preDraw(ccvs, x, y, 40, 1.0);
		this._balloon.preDraw(ccvs, x, y, 50, 1.0);
		this._shadow.preDraw(ccvs, x, y, 0);
		switch(this.motion){
			case "walk": this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			default: this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0); break;
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._nametag.exist = false;
		this._balloon.exist = false;
		this._shadow.exist = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

