import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./Page.jsx";
import "./MyPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class WorldPage extends Page{
	// HTMLタグ
	var htmlTag = """
		<div>あいうえお</div>
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "world";
		this.div.innerHTML = this.htmlTag;
		Page.parentDiv.appendChild(this.div);

		// ヘッダ設定
		Page.titleDiv.innerHTML = "ワールド";
		Page.backDiv.innerHTML = "back";
		Page.menuDiv.innerHTML = "menu";

		this.serialPush(new WorldPageTest(this.div));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
		Page.parentDiv.removeChild(this.div);
		this.div = null;
	}
}

class WorldPageTest extends EventCartridge{
	var btnList : Map.<PageButton>;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.btnList = {} : Map.<PageButton>;
		this.btnList["back"] = new PageButton(Page.backDiv);
		this.btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){this.btnList[name].calc();}

		if(this.btnList["back"].trigger){
			this.btnList["back"].trigger = false;
			Page.transitionsPage(new MyPage(), false);
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

