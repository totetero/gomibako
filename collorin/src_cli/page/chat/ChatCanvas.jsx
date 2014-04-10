import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/DrawUnit.jsx";
import "../../bb3d/GridField.jsx";

import "ChatCharacter.jsx";
import "ChatPathFinder.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class ChatCanvas extends Ccvs{
	var field : GridField;
	var player : ChatCharacter;
	var member = new ChatCharacter[];

	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var pathFinder : ChatPathFinder;
	var calced : boolean;
	var _FieldTapped : boolean;
	var tappedCharacter : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement){
		super(canvas, 320, 480, Math.PI / 180 * 45, Math.PI / 180 * 45, 2);
	}

	// ----------------------------------------------------------------
	// 初期化
	function init(response : variant) : void{
		// フィールド
		this.field = new GridField(this, Loader.imgs["img_grid"], response["grid"] as int[][]);
		this.pathFinder = new ChatPathFinder(this.field);
		// 初期カメラ位置
		this.cx = this.calcx = (this.cxmax + this.cxmin) * 0.5;
		this.cy = this.calcy = (this.cymax + this.cymin) * 0.5;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean, pressField : function():void, pressChara : function(chara:ChatCharacter):void) : void{
		// キャンバス座標回転と押下確認
		this.calcTouchCoordinate(clickable);
		this.calcTouchRotate();
		this.calcRotv(this.calcrotv, 0.2);
		this.calcRoth(Math.PI / 180 * 30, 0.1);
		this.scale -= (this.scale - 1) * 0.1;
		this.cx -= (this.cx - this.calcx) * 0.1;
		this.cy -= (this.cy - this.calcy) * 0.1;

		// キャラクター計算
		for(var i = 0; i < this.member.length; i++){
			this.member[i].calc(this);
			if(!this.member[i].exist){this.member.splice(i--,1);}
		}

		if(this.player != null){
			// カメラ位置をプレイヤーに
			this.calcx = this.player.x;
			this.calcy = this.player.y;
		}

		// キャラクターフィールド押下確認
		if(this.trigger_mup){
			this.trigger_mup = false;
			if(!Ctrl.mmv){
				if(pressChara != null && this.tappedCharacter >= 0){
					// キャラクター押下
					pressChara(this.member[this.tappedCharacter]);
				}else if(pressField != null){
					// フィールド押下
					pressField();
				}
			}
		}

		// キャラクタータップ確認
		this.tappedCharacter = -1;
		if(this.mdn && !Ctrl.mmv && pressChara != null){
			for(var i = 0, depth = 0; i < this.member.length; i++){
				var cdepth = this.member[i].getDepth();
				if((this.tappedCharacter < 0 || depth < cdepth) && this.member[i].isOver(this.mx, this.my)){
					depth = cdepth;
					this.tappedCharacter = i;
				}
			}
		}

		// キャラクター描画設定
		for(var i = 0; i < this.member.length; i++){this.member[i].setColor((this.tappedCharacter == i) ? "rgba(255, 255, 255, 0.5)" : "");}
		// フィールド描画設定
		this._FieldTapped = (this.mdn && !Ctrl.mmv && pressField != null && this.tappedCharacter < 0);
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(exist : boolean) : boolean{
		if(!this.calced){
			for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}

			this.context.clearRect(0, 0, this.width, this.height);
			this.field.draw(this, this.cx, this.cy, this._FieldTapped);
			DrawUnit.drawList(this, this.slist);
			DrawUnit.drawList(this, this.clist);
		}

		// sec切り替え時に再計算再描画しないための処理
		this.calced = !exist;
		return exist;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

