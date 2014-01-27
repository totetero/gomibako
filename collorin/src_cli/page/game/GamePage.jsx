import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class GamePage extends Page{
	// HTMLタグ
	var htmlTag = """
		<div>あいうえお</div>
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "game";
		this.div.innerHTML = this.htmlTag;
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
		this.headerType = 0;
	}

	// 初期化
	override function init() : void{
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECgamePageMain(this.div));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECgamePageMain extends EventCartridge{
	var btnList : Map.<PageButton>;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.btnList = {} : Map.<PageButton>;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){this.btnList[name].calc();}

		return true;
	}

	// 描画
	override function draw() : void{
		for(var name in this.btnList){this.btnList[name].draw();}
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

