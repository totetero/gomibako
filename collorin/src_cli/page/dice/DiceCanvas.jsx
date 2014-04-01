import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/DrawUnit.jsx";
import "../../bb3d/DrawEffect.jsx";
import "../../bb3d/HexField.jsx";
import "../../bb3d/Dice.jsx";

import "DiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class DiceCanvas extends Ccvs{
	var field : HexField;
	var member = {} : Map.<DiceCharacter>;
	var dices = new DrawThrowDice[];
	var effect = new DrawEffect[];
	var center : DiceCharacter[];

	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var tapped : boolean;
	var tappedCharacter : string;

	// 背景
	var _bgimg : HTMLImageElement;
	var _bgcolor1 : string;
	var _bgcolor2 : string;
	var _bgaction = 0;

	// ----------------------------------------------------------------
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
		var charaInfoList = response["charaInfo"] as Map.<variant>;
		for(var id in charaInfoList){
			this.member[id] = new DiceCharacter(this, charaInfoList[id]);
		}
 		// 初期カメラ位置
		var hexx = response["camera"][0] as int;
		var hexy = response["camera"][1] as int;
		this.cx = this.calcx = this.field.calcHexCoordx(hexx, hexy);
		this.cy = this.calcy = this.field.calcHexCoordy(hexx, hexy);
		// 背景
		this._bgimg = Loader.imgs["img_background_" + response["background"] as string];
		var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		var context = canvas.getContext("2d") as CanvasRenderingContext2D;
		canvas.width = 1;
		canvas.height = this._bgimg.height;
		context.drawImage(this._bgimg, 0, 0);
		var data1 = context.getImageData(0, 0, 1, 1).data;
		var data2 = context.getImageData(0, this._bgimg.height - 1, 1, 1).data;
		this._bgcolor1 = "rgb(" + data1[0] + "," + data1[1] + "," + data1[2] + ")";
		this._bgcolor2 = "rgb(" + data2[0] + "," + data2[1] + "," + data2[2] + ")";
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
		for(var id in this.member){
			this.member[id].calc(this);
			if(!this.member[id].exist){delete this.member[id];}
		}

		// エフェクト計算
		for(var i = 0; i < this.effect.length; i++){
			this.effect[i].calc();
			if(!this.effect[i].exist){this.effect.splice(i--, 1);}
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
				if(pressChara != null && this.tappedCharacter != ""){
					// キャラクター押下
					pressChara();
				}else if(pressField != null){
					// フィールド押下
					pressField();
				}
			}
		}

		// キャラクタータップ確認
		this.tappedCharacter = "";
		if(this.mdn && !Ctrl.mmv && pressChara != null){
			var depth0 = 0;
			for(var id in this.member){
				var side = this.member[id].side;
				if(side != "player" && side != "enemy"){continue;}
				var depth1 = this.member[id].getDepth();
				if((this.tappedCharacter == "" || depth0 < depth1) && this.member[id].isOver(this.mx, this.my)){
					depth0 = depth1;
					this.tappedCharacter = id;
				}
			}
		}

		// キャラクター描画設定
		for(var id in this.member){this.member[id].setColor((this.tappedCharacter == id) ? "rgba(255, 255, 255, 0.5)" : "");}
		// フィールド描画設定
		this.tapped = (this.mdn && !Ctrl.mmv && pressField != null && this.tappedCharacter == "");
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var id in this.member){this.member[id].preDraw(this);}
		for(var i = 0; i < this.effect.length; i++){this.effect[i].preDraw(this, this.cx, this.cy);}

		this._drawBackground();
		this.field.draw(this, this.cx, this.cy, this.tapped);
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
		for(var i = 0; i < this.dices.length; i++){this.dices[i].draw(this);}
	}

	// ----------------------------------------------------------------
	// 背景描画
	function _drawBackground() : void{
		//this.context.clearRect(0, 0, this.width, this.height);
		this.context.fillStyle = this._bgcolor1;
		this.context.fillRect(0, 0, this.width, this.height * 0.5);
		this.context.fillStyle = this._bgcolor2;
		this.context.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
		var x = -(this._bgaction++) % this._bgimg.width;
		var y = (this.height - this._bgimg.height) * 0.5;
		while(x < this.width){
			this.context.drawImage(this._bgimg, x, y);
			x += this._bgimg.width;
		}
	}

	// ----------------------------------------------------------------
	// エフェクト追加
	function pushEffect(effect : DrawEffect) : void{
		this.effect.push(effect);
		this.clist.push(effect);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

