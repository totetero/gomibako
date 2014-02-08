import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/Character.jsx";
import "../../bb3d/HexField.jsx";
import "../Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class GamePage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
	""";

	// キャンバス
	var ccvs : GameCanvas;

	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
		this.headerType = 0;
		this.lctrlType = 1;
		this.rctrlType = 1;
	}

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page game";
		this.div.innerHTML = this._htmlTag;
		// キャンバス
		this.ccvs = new GameCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// イベント設定
		this.serialPush(new SECloadPage("/game", null, function(response : variant) : void{
			// データの形成
			this.ccvs.init(response);
		}));
		this.serialPush(new ECdrawOne(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECgamePageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECgamePageMain extends EventCartridge{
	var _page : GamePage;

	// コンストラクタ
	function constructor(page : GamePage){
		this._page = page;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		this._page.ccvs.calcTouchCoordinate(true);
		this._page.ccvs.calcTouchRotate();
		this._page.ccvs.calcRotate(this._page.ccvs.rotv, Math.PI / 180 * 30, 2.5);
		this._page.ccvs.player.calc(this._page.ccvs);
		return true;
	}

	// 描画
	override function draw() : void{
		this._page.ccvs.draw();
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class GameCanvas extends Ccvs{
	var field : HexField;
	var player : GameCharacter;
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
		this.player = new GameCharacter(this, charaInfoList[0][0]);
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
class GameCharacter{
	var _character : DrawCharacter;
	var _shadow : DrawShadow;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : GameCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["id"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		var hexx = charaInfo["x"] as int;
		var hexy = charaInfo["y"] as int;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.slist.push(this._shadow);
		this.x = ccvs.field.calcHexCoordx(hexx, hexy);
		this.y = ccvs.field.calcHexCoordy(hexx, hexy);
		this.r = charaInfo["r"] as number;
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

