import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/Character.jsx";
import "../../bb3d/GridField.jsx";

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
	var tapped : boolean;
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
		this.field = new GridField(this, Loader.imgs["grid"], response["grid"] as int[][]);
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
		this.tapped = (this.mdn && !Ctrl.mmv && pressField != null && this.tappedCharacter < 0);
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
class ChatCharacter{
	var _character : DrawCharacter;
	var _nametag : DrawText;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;

	var uid : int;
	var name : string;
	var code : string;

	var exist = true;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;
	var dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		this.uid = charaInfo["uid"] as int;
		this.name = charaInfo["name"] as string;
		this.code = charaInfo["code"] as string;
		this.x = charaInfo["x"] as int * 16 + 8;
		this.y = charaInfo["y"] as int * 16 + 8;
		this.r = charaInfo["r"] as int * Math.PI * 0.25;

		var img = Loader.imgs["dot_" + this.code];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._nametag = new DrawText(this.name);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._nametag);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);
		this.setTalk(charaInfo["serif"] as string);
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

