import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Ccvs.jsx";
import "../Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class GamePage extends Page{
	// HTMLタグ
	var htmlTag = """
		<canvas></canvas>
	""";

	// キャンバス情報
	var ccvs : Ccvs;

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "game";
		this.div.innerHTML = this.htmlTag;
		// キャンバス
		this.ccvs = new Ccvs(320, 480, this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
		this.headerType = 0;
	}

	// 初期化
	override function init() : void{
		// テスト
		Loader.loadImg({player: "img/character/player0/dot.png"}, function() : void{
			log Loader.imgs;
		}, function():void{});

		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECgamePageMain(this));
	}

	// キャンバス描画
	function canvasDraw() : void{
		// test
		this.ccvs.context.fillRect(0, 0, this.ccvs.width, this.ccvs.height);
		this.ccvs.context.drawImage(Loader.imgs["player"], 10, 10, 64, 64);
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
		this.ccvs.dispose();
	}
}

class SECgamePageMain extends SECctrlCanvas{
	var page : GamePage;

	// コンストラクタ
	function constructor(page : GamePage){
		super(page.ccvs);
		this.page = page;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		super.calc();
		return true;
	}

	// 描画
	override function draw() : void{
		this.page.canvasDraw();
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

