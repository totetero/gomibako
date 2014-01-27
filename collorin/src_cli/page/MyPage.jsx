import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// HTMLタグ
	var htmlTag = """
		<div class="navi">
			<div class="b1">ワールド</div>
			<div class="b2">クエスト</div>
			<div class="b3">キャラクター</div>
			<div class="b4">アイテム</div>
		</div>

		<div class="footer">おしらせバナースペース</div>
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "mypage";
		this.div.innerHTML = this.htmlTag;
		// プロパティ設定
		this.name = "マイページ";
		this.depth = 1;
		this.headerType = 1;
	}

	// 初期化
	override function init() : void{
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECmyPageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECmyPageMain extends EventCartridge{
	var page : MyPage;
	var btnList : Map.<PageButton>;

	// コンストラクタ
	function constructor(page : MyPage){
		this.page = page;
		this.btnList = {} : Map.<PageButton>;
		this.btnList["b1"] = new PageButton(this.page.div.getElementsByClassName("b1").item(0) as HTMLDivElement);
		this.btnList["b2"] = new PageButton(this.page.div.getElementsByClassName("b2").item(0) as HTMLDivElement);
		this.btnList["b3"] = new PageButton(this.page.div.getElementsByClassName("b3").item(0) as HTMLDivElement);
		this.btnList["b4"] = new PageButton(this.page.div.getElementsByClassName("b4").item(0) as HTMLDivElement);
		this.btnList["back"] = new PageButton(Page.backDiv);
		this.btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){this.btnList[name].calc();}

		if(this.btnList["b1"].trigger){
			this.btnList["b1"].trigger = false;
			Page.transitionsPage("world");
		}

		if(this.btnList["back"].trigger){
			this.btnList["back"].trigger = false;
			// トップに戻る
			dom.document.location.href = "/top";
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

