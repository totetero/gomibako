import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/DrawUnit.jsx";
import "../../bb3d/HexField.jsx";
import "../../bb3d/Dice.jsx";

import "DiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class DiceCanvas extends Ccvs{
	var field : HexField;
	var member = new DiceCharacter[][];
	var dices = new DrawThrowDice[];

	var center : DiceCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var tapped : boolean;
	var tappedType : int;
	var tappedCharacter : int;

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
		for(var i = 0; i < charaInfoList.length; i++){
			this.member[i] = new DiceCharacter[];
			for(var j = 0; j < charaInfoList[i].length; j++){
				this.member[i].push(new DiceCharacter(this, charaInfoList[i][j]));
			}
		}
 		// 初期カメラ位置
		var hexx = response["camera"][0] as int;
		var hexy = response["camera"][1] as int;
		this.cx = this.calcx = this.field.calcHexCoordx(hexx, hexy);
		this.cy = this.calcy = this.field.calcHexCoordy(hexx, hexy);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean, camera : int, pressField : function():void, pressChara : function():void) : void{
		// キャンバス座標回転と押下確認
		this.calcTouchCoordinate(clickable);
		if(camera == 1){
			// マップ用カメラ
			this.calcTouchMove();
			this.calcRotv(0, 0.2);
			this.calcRoth(Math.PI / 180 * 90, 0.1);
			this.scale -= (this.scale - 1) * 0.1;
			this.cx -= (this.cx - this.calcx) * 0.5;
			this.cy -= (this.cy - this.calcy) * 0.5;
		}else if(camera == 2){
			// 拡大カメラ
			this.calcTouchRotate();
			this.calcRotv(this.calcrotv, 0.2);
			this.calcRoth(Math.PI / 180 * 30, 0.1);
			this.scale -= (this.scale - 4) * 0.1;
			this.cx -= (this.cx - this.calcx) * 0.2;
			this.cy -= (this.cy - this.calcy) * 0.2;
		}else{
			// 通常カメラ
			this.calcTouchRotate();
			this.calcRotv(this.calcrotv, 0.2);
			this.calcRoth(Math.PI / 180 * 30, 0.1);
			this.scale -= (this.scale - 2.5) * 0.1;
			this.cx -= (this.cx - this.calcx) * 0.2;
			this.cy -= (this.cy - this.calcy) * 0.2;
		}

		// キャラクター計算
		for(var i = 0; i < this.member.length; i++){
			for(var j = 0; j < this.member[i].length; j++){
				this.member[i][j].calc(this);
				if(!this.member[i][j].exist){this.member[i].splice(j--, 1);}
			}
		}

		// さいころ計算
		for(var i = 0; i < this.dices.length; i++){this.dices[i].calc();}

		if(this.center != null && this.center.length > 0){
			// カメラ位置
			var cx = 0;
			var cy = 0;
			for(var i = 0; i < this.center.length; i++){
				cx += this.center[i].x;
				cy += this.center[i].y;
			}
			this.calcx = cx / this.center.length;
			this.calcy = cy / this.center.length;
		}

		// キャラクターフィールド押下確認
		if(this.trigger_mup){
			this.trigger_mup = false;
			if(!Ctrl.mmv){
				if(pressChara != null && this.tappedType >= 0){
					// キャラクター押下
					pressChara();
				}else if(pressField != null){
					// フィールド押下
					pressField();
				}
			}
		}

		// キャラクタータップ確認
		this.tappedType = -1;
		if(this.mdn && !Ctrl.mmv && pressChara != null){
			var depth0 = 0;
			for(var i = 0; i < this.member.length; i++){
				if(i != 0 && i != 1){continue;}
				for(var j = 0; j < this.member[i].length; j++){
					var depth1 = this.member[i][j].getDepth();
					if((this.tappedType < 0 || depth0 < depth1) && this.member[i][j].isOver(this.mx, this.my)){
						depth0 = depth1;
						this.tappedType = i;
						this.tappedCharacter = j;
					}
				}
			}
		}

		// キャラクター描画設定
		for(var i = 0; i < this.member.length; i++){for(var j = 0; j < this.member[i].length; j++){this.member[i][j].setColor((this.tappedType == i && this.tappedCharacter == j) ? "rgba(255, 255, 255, 0.5)" : "");}}
		// フィールド描画設定
		this.tapped = (this.mdn && !Ctrl.mmv && pressField != null && this.tappedType < 0);
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, this.tapped);
		for(var i = 0; i < this.member.length; i++){for(var j = 0; j < this.member[i].length; j++){this.member[i][j].preDraw(this);}}
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
		for(var i = 0; i < this.dices.length; i++){this.dices[i].draw(this);}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

