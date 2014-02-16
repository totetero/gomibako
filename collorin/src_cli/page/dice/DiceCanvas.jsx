import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/Character.jsx";
import "../../bb3d/HexField.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class DiceCanvas extends Ccvs{
	var field : HexField;
	var member = new DiceCharacter[];
	var clist : DrawUnit[] = new DrawUnit[];
	var slist : DrawUnit[] = new DrawUnit[];
	var tapped : boolean;

	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement){
		super(canvas, 320, 480, Math.PI / 180 * 30, Math.PI / 180 * 45, 1);
	}

	// ----------------------------------------------------------------
	// 初期化
	function init(response : variant) : void{
		// フィールド
		this.field = new HexField(this, response["hex"] as HexFieldCell[]);
		// キャラクター
		var charaInfoList = response["charaInfo"] as variant[][];
		this.member.push(new DiceCharacter(this, charaInfoList[0][0]));
		// 初期カメラ位置
		this.cx = this.member[0].x;
		this.cy = this.member[0].y;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, this.tapped);
		for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}	
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class DiceCharacter{
	var _character : DrawCharacter;
	var _shadow : DrawShadow;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : DiceCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["code"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		var hexx = charaInfo["x"] as int;
		var hexy = charaInfo["y"] as int;

		this.x = ccvs.field.calcHexCoordx(hexx, hexy);
		this.y = ccvs.field.calcHexCoordy(hexx, hexy);
		this.r = charaInfo["r"] as number;

		this._character = new DrawCharacter(img, drawInfo, size);
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.slist.push(this._shadow);
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

