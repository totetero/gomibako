import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class WorldPage extends Page{
	// HTMLタグ
	var htmlTag = """
		<div class="btn">テストステージ</div>
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "world";
		this.div.innerHTML = this.htmlTag;
		// プロパティ設定
		this.name = "ワールド";
		this.depth = 2;
		this.headerType = 2;
	}

	// 初期化
	override function init() : void{
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECworldPageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECworldPageMain extends EventCartridge{
	var page : WorldPage;
	var btnList : Map.<PageButton>;

	// コンストラクタ
	function constructor(page : WorldPage){
		this.page = page;
		this.btnList = {} : Map.<PageButton>;
		this.btnList["btn"] = new PageButton(this.page.div.getElementsByClassName("btn").item(0) as HTMLDivElement);
		this.btnList["back"] = new PageButton(Page.backDiv);
		this.btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){this.btnList[name].calc();}

		if(this.btnList["btn"].trigger){
			this.btnList["btn"].trigger = false;
			Page.transitionsPage("game");
		}

		if(this.btnList["back"].trigger){
			this.btnList["back"].trigger = false;
			Page.transitionsPage("mypage");
		}

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

