import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "../bb3d/Ccvs.jsx";
import "../bb3d/Character.jsx";
import "../bb3d/GridField.jsx";
import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class ChatPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
	""";

	// キャンバス情報
	var ccvs : Ccvs;
	// キャラクター
	var field : GridField;
	var player : ChatCharacter;
	var clist : DrawUnit[] = new DrawUnit[];
	var slist : DrawUnit[] = new DrawUnit[];

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chat";
		this.div.innerHTML = this._htmlTag;
		// キャンバス
		this.ccvs = new Ccvs(320, 480, this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);
		this.ccvs.scale = 2;
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
		this.headerType = 0;

		// イベント設定
		this.serialPush(new SECloadPage("/chat", null, function(response : variant) : void{
			// データの形成
			log response;
			// フィールドテスト
			this.field = new GridField(this.ccvs, Loader.imgs["grid"], [
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] : int[],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] : int[],
				[1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,1] : int[],
				[1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1] : int[],
				[1,1,3,3,3,1,1,1,1,1,1,3,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,0,0,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,0,0,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,1,1,1,1,1,1,1,1,3,3,1,1] : int[],
				[1,1,3,3,3,1,1,1,1,1,1,3,3,3,1,1] : int[],
				[1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1] : int[],
				[1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,1] : int[],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] : int[],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] : int[]
			]);
			// キャラクターテスト
			this.player = new ChatCharacter(this);

			//this.canvasDraw();
			this.serialPush(new SECchatPageMain(this));
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

class SECchatPageMain extends SECctrlCanvas{
	var _page : ChatPage;

	// コンストラクタ
	function constructor(page : ChatPage){
		super(page.ccvs, 1);
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
class ChatCharacter{
	var _character : DrawCharacter;
	var _shadow : DrawShadow;
	var x : number;
	var y : number;
	var r : number;
	var motion : string;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage){
		var cdat : variant = {"weapon":"whiteSword","parts":{"head":[[0.00,0.00,0.00,0,0,16,0],[-0.06,0.20,-0.02,0,48,16,0],[-0.06,-0.20,-0.02,0,48,16,1],[-0.19,0.00,-0.09,0,64,16,0],[-0.16,0.00,0.08,0,80,16,0],],"body":[[0.00,0.00,0.00,0,16,16,0]],"ftr1":[[0.00,0.00,0.00,0,32,8,0]],"ftl1":[[0.00,0.00,0.00,0,32,8,1]],"ftr2":[[0.00,0.00,0.00,32,32,8,0]],"ftl2":[[0.00,0.00,0.00,32,32,8,1]],"hndr":[[0.00,0.00,0.00,0,40,8,0]],"hndl":[[0.00,0.00,0.00,0,40,8,1]],},"pose":{"stand":[{"head":[1,0.00,0.00,0.52,45*0],"body":[1,-0.02,0.00,0.27,0],"ftr1":[1,0.02,0.10,0.10,0],"ftl1":[1,-0.02,-0.10,0.10,0],"hndr":[0,-0.02,0.20,0.25,0],"hndl":[0,0.02,-0.20,0.25,0],},],"walk":[{"head":[1,0.12,0.00,0.45,0],"body":[1,0.00,0.00,0.23,0],"ftr1":[1,0.10,0.07,0.10,0],"ftl2":[1,-0.20,-0.07,0.20,0],"hndr":[0,-0.10,0.15,0.25,0],"hndl":[0,0.10,-0.15,0.25,0],},{"head":[1,0.12,0.00,0.47,0],"body":[1,0.00,0.00,0.26,0],"ftr1":[1,0.00,0.07,0.10,0],"ftl1":[1,0.00,-0.07,0.15,0],"hndr":[0,-0.05,0.18,0.25,0],"hndl":[0,0.05,-0.18,0.25,0],},{"head":[1,0.12,0.00,0.45,0],"body":[1,0.00,0.00,0.23,0],"ftr2":[1,-0.20,0.07,0.20,0],"ftl1":[1,0.10,-0.07,0.10,0],"hndr":[0,0.10,0.15,0.25,0],"hndl":[0,-0.10,-0.15,0.25,0],},{"head":[1,0.12,0.00,0.47,0],"body":[1,0.00,0.00,0.26,0],"ftr1":[1,0.00,0.07,0.15,0],"ftl1":[1,0.00,-0.07,0.10,0],"hndr":[0,0.05,0.18,0.25,0],"hndl":[0,-0.05,-0.18,0.25,0],},],"dive":[{"head":[1,0.12,0.00,0.30,0],"body":[1,-0.02,0.00,0.20,0],"ftr2":[1,-0.18,0.07,0.10,0],"ftl2":[1,-0.18,-0.07,0.10,0],"hndr":[0,0.20,0.13,0.17,0],"hndl":[0,0.20,-0.13,0.17,0],},],"roll":[{"head":[3,-0.06,0.00,0.22,0],"body":[3,0.02,0.00,0.45,0],"ftr2":[4,-0.14,0.07,0.50,0],"ftl2":[4,-0.14,-0.07,0.50,0],"hndr":[0,-0.12,0.15,0.50,0],"hndl":[0,-0.12,-0.15,0.50,0],},{"head":[1,0.06,0.00,0.38,0],"body":[1,-0.02,0.00,0.15,0],"ftr2":[2,0.14,0.07,0.10,0],"ftl2":[2,0.14,-0.07,0.10,0],"hndr":[0,0.12,0.15,0.10,0],"hndl":[0,0.12,-0.15,0.10,0],},],"attack1":[{"head":[1,0.00,0.00,0.55,0],"body":[1,-0.02,0.00,0.30,0],"ftr1":[1,0.00,0.10,0.10,0],"ftl1":[1,0.00,-0.10,0.12,0],"hndr":[0,0.08,-0.05,0.28,0],"hndl":[0,0.00,-0.20,0.28,0],},{"head":[1,0.00,0.00,0.55,0],"body":[1,-0.02,0.00,0.30,0],"ftr1":[1,0.00,0.10,0.10,0],"ftl1":[1,0.00,-0.10,0.12,0],"hndr":[0,0.08,-0.05,0.28,0],"hndl":[0,0.00,-0.20,0.28,0],},{"head":[1,0.03,0.00,0.53,0],"body":[1,-0.01,0.00,0.28,0],"ftr1":[1,-0.02,0.10,0.10,0],"ftl1":[1,0.02,-0.10,0.15,0],"hndr":[0,0.06,-0.08,0.26,0],"hndl":[0,0.00,-0.20,0.26,0],"weapon":[0,0.6,0,0.25,0],},{"head":[1,0.05,0.00,0.51,0],"body":[1,0.01,0.00,0.26,0],"ftr1":[1,-0.04,0.09,0.10,0],"ftl1":[1,0.04,-0.09,0.15,0],"hndr":[0,0.08,-0.05,0.24,0],"hndl":[0,0.00,-0.20,0.24,0],"weapon":[1,0.6,0,0.25,0],},{"head":[1,0.08,0.00,0.50,0],"body":[1,0.03,0.00,0.25,0],"ftr1":[1,-0.08,0.08,0.10,0],"ftl1":[1,0.08,-0.08,0.10,0],"hndr":[0,0.12,0.15,0.23,0],"hndl":[0,0.00,-0.20,0.23,0],"weapon":[2,0.6,0,0.25,0],},{"head":[1,0.08,0.00,0.50,0],"body":[1,0.03,0.00,0.25,0],"ftr1":[1,-0.08,0.08,0.10,0],"ftl1":[1,0.08,-0.08,0.10,0],"hndr":[0,0.12,0.15,0.23,0],"hndl":[0,0.00,-0.20,0.23,0],"weapon":[2,0.6,0,0.25,0],},],"attack2":[{"head":[1,0.08,0.00,0.50,0],"body":[1,0.03,0.00,0.25,0],"ftr1":[1,-0.08,0.08,0.10,0],"ftl1":[1,0.08,-0.08,0.10,0],"hndr":[0,0.08,0.20,0.23,0],"hndl":[0,0.00,-0.20,0.23,0],"weapon":[3,0.6,0,0.25,0],},{"head":[1,0.08,0.00,0.50,0],"body":[1,0.03,0.00,0.25,0],"ftr1":[1,-0.08,0.08,0.10,0],"ftl1":[1,0.08,-0.08,0.10,0],"hndr":[0,0.08,0.20,0.23,0],"hndl":[0,0.00,-0.20,0.23,0],"weapon":[3,0.6,0,0.25,0],},{"head":[1,0.08,0.00,0.50,0],"body":[1,0.03,0.00,0.25,0],"ftr1":[1,-0.08,0.08,0.10,0],"ftl1":[1,0.08,-0.08,0.10,0],"hndr":[0,0.08,0.20,0.23,0],"hndl":[0,0.00,-0.20,0.23,0],"weapon":[3,0.6,0,0.25,0],},],"damage":[{"head":[1,0.00,0.00,0.45+0.25,0],"body":[1,-0.02,0.00,0.20+0.25,0],"ftr2":[2,0.12,0.10,0.10+0.25,0],"ftl2":[2,0.12,-0.10,0.10+0.25,0],"hndr":[0,0.02,0.20,0.28+0.25,0],"hndl":[0,0.02,-0.20,0.28+0.25,0],},{"head":[1,0.00,0.00,0.45+0.3,0],"body":[1,-0.02,0.00,0.20+0.3,0],"ftr2":[2,0.12,0.10,0.10+0.3,0],"ftl2":[2,0.12,-0.10,0.10+0.3,0],"hndr":[0,0.02,0.20,0.28+0.3,0],"hndl":[0,0.02,-0.20,0.28+0.3,0],},{"head":[1,0.00,0.00,0.45+0.25,0],"body":[1,-0.02,0.00,0.20+0.25,0],"ftr2":[2,0.12,0.10,0.10+0.25,0],"ftl2":[2,0.12,-0.10,0.10+0.25,0],"hndr":[0,0.02,0.20,0.28+0.25,0],"hndl":[0,0.02,-0.20,0.28+0.25,0],},{"head":[1,0.00,0.00,0.45+0.1,0],"body":[1,-0.02,0.00,0.20+0.1,0],"ftr2":[2,0.12,0.10,0.10+0.1,0],"ftl2":[2,0.12,-0.10,0.10+0.1,0],"hndr":[0,0.02,0.20,0.28+0.1,0],"hndl":[0,0.02,-0.20,0.28+0.1,0],},{"head":[1,0.00,0.00,0.45,0],"body":[1,-0.02,0.00,0.20,0],"ftr2":[2,0.12,0.10,0.10,0],"ftl2":[2,0.12,-0.10,0.10,0],"hndr":[0,0.02,0.20,0.28,0],"hndl":[0,0.02,-0.20,0.28,0],},{"head":[1,0.12,0.00,0.43,0],"body":[1,-0.02,0.00,0.22,0],"ftr1":[1,-0.02,0.10,0.10,0],"ftl1":[1,-0.02,-0.10,0.10,0],"hndr":[0,0.05,0.18,0.25,0],"hndl":[0,0.05,-0.18,0.25,0],},{"head":[1,0.12,0.00,0.43,0],"body":[1,-0.02,0.00,0.22,0],"ftr1":[1,-0.02,0.10,0.10,0],"ftl1":[1,-0.02,-0.10,0.10,0],"hndr":[0,0.05,0.18,0.25,0],"hndl":[0,0.05,-0.18,0.25,0],},{"head":[1,0.12,0.00,0.43,0],"body":[1,-0.02,0.00,0.22,0],"ftr1":[1,-0.02,0.10,0.10,0],"ftl1":[1,-0.02,-0.10,0.10,0],"hndr":[0,0.05,0.18,0.25,0],"hndl":[0,0.05,-0.18,0.25,0],},{"head":[1,0.12,0.00,0.43,0],"body":[1,-0.02,0.00,0.22,0],"ftr1":[1,-0.02,0.10,0.10,0],"ftl1":[1,-0.02,-0.10,0.10,0],"hndr":[0,0.05,0.18,0.25,0],"hndl":[0,0.05,-0.18,0.25,0],},],}};
		var drawInfo = new DrawInfo(cdat);
		var size = 1.2;
		this._character = new DrawCharacter(Loader.imgs["player"], drawInfo, size);
		this._shadow = new DrawShadow(size);
		page.clist.push(this._character);
		page.slist.push(this._shadow);
		this.x = 100;
		this.y = 100;
		this.r = 0;
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

