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

	// キャンバス情報
	var ccvs : Ccvs;
	// キャラクター
	var field : HexField;
	var player : GameCharacter;
	var clist : DrawUnit[] = new DrawUnit[];
	var slist : DrawUnit[] = new DrawUnit[];

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page game";
		this.div.innerHTML = this._htmlTag;
		// キャンバス
		this.ccvs = new Ccvs(320, 480, this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
		this.headerType = 0;

		// イベント設定
		this.serialPush(new SECloadPage("/game", null, function(response : variant) : void{
			// フィールド
			this.field = new HexField(this.ccvs, response["hex"] as HexFieldCell[]);
			// キャラクター
			var charaInfoList = response["charaInfo"] as variant[][];
			this.player = new GameCharacter(this, charaInfoList[0][0]);

			//this.canvasDraw();
			this.serialPush(new SECgamePageMain(this));
		}));
		this.serialPush(new SECtransitionsPage(this));
	}

	// キャンバス描画
	function canvasDraw() : void{
		this.ccvs.context.clearRect(0, 0, this.ccvs.width, this.ccvs.height);
		this.field.draw(this.ccvs, this.ccvs.cx, this.ccvs.cy, Ctrl.mdn && !Ctrl.mmv);
		if(this.player != null){this.player.preDraw(this.ccvs);}
		DrawUnit.drawList(this.ccvs, this.slist);
		DrawUnit.drawList(this.ccvs, this.clist);
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
		//this.ccvs.dispose();
	}
}

class SECgamePageMain extends SECctrlCanvas{
	var _page : GamePage;

	// コンストラクタ
	function constructor(page : GamePage){
		super(page.ccvs, 2.5);
		this._page = page;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		super.calc();
		this._page.player.calc(this.ccvs);
		return true;
	}

	// 描画
	override function draw() : void{
		this._page.canvasDraw();
	}

	// 破棄
	override function dispose() : void{
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
	function constructor(page : GamePage, charaInfo : variant){
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		var hexx = charaInfo["x"] as int;
		var hexy = charaInfo["y"] as int;
		this._character = new DrawCharacter(Loader.imgs["dot_player0"], drawInfo, size);
		this._shadow = new DrawShadow(size);
		page.clist.push(this._character);
		page.slist.push(this._shadow);
		this.x = page.field.calcHexCoordx(hexx, hexy);
		this.y = page.field.calcHexCoordy(hexx, hexy);
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

