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
	var player : DiceCharacter;
	var clist : DrawUnit[] = new DrawUnit[];
	var slist : DrawUnit[] = new DrawUnit[];

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
		this.player = new DiceCharacter(this, charaInfoList[0][0]);
		// 初期カメラ位置
		this.cx = this.player.x;
		this.cy = this.player.y;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, Ctrl.mdn && !Ctrl.mmv);
		this.player.preDraw(this);
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

	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;

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
	// 計算
	function calc(ccvs : Ccvs) : void{
		this.action++;
		if     (Ctrl.krt && Ctrl.kup){this.r = Math.PI * 1.74 - ccvs.rotv;}
		else if(Ctrl.klt && Ctrl.kup){this.r = Math.PI * 1.26 - ccvs.rotv;}
		else if(Ctrl.klt && Ctrl.kdn){this.r = Math.PI * 0.74 - ccvs.rotv;}
		else if(Ctrl.krt && Ctrl.kdn){this.r = Math.PI * 0.26 - ccvs.rotv;}
		else if(Ctrl.krt){this.r = Math.PI * 0.00 - ccvs.rotv;}
		else if(Ctrl.kup){this.r = Math.PI * 1.50 - ccvs.rotv;}
		else if(Ctrl.klt){this.r = Math.PI * 1.00 - ccvs.rotv;}
		else if(Ctrl.kdn){this.r = Math.PI * 0.50 - ccvs.rotv;}
		else{this.action = 0;}
		if(this.action > 0){
			var speed = 3;
			this.x += speed * Math.cos(this.r);
			this.y += speed * Math.sin(this.r);
			this.motion = "walk";
		}else{
			this.motion = "stand";
		}
		ccvs.cx = this.x;
		ccvs.cy = this.y;
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs) : void{
		var x = this.x - ccvs.cx;
		var y = this.y - ccvs.cy;
		this._shadow.preDraw(ccvs, x, y, 0);
		switch(this.motion){
			case "walk": this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk")); break;
			default: this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0); break;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

