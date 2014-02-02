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
	var _htmlTag = """
		<div class="navi">
			<div class="b1">ワールド</div>
			<div class="b2">クエスト</div>
			<div class="b3">キャラクター</div>
			<div class="b4">アイテム</div>
		</div>

		<div class="footer">おしらせバナースペース</div>
	""";

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page mypage";
		this.div.innerHTML = this._htmlTag;
		// プロパティ設定
		this.name = "マイページ";
		this.depth = 1;
		this.headerType = 1;

		// イベント設定
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECmyPageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECmyPageMain extends EventCartridge{
	var _page : MyPage;
	var _btnList = {} : Map.<PageButton>;

	// コンストラクタ
	function constructor(page : MyPage){
		this._page = page;
		this._btnList["b1"] = new PageButton(this._page.div.getElementsByClassName("b1").item(0) as HTMLDivElement);
		this._btnList["b2"] = new PageButton(this._page.div.getElementsByClassName("b2").item(0) as HTMLDivElement);
		this._btnList["b3"] = new PageButton(this._page.div.getElementsByClassName("b3").item(0) as HTMLDivElement);
		this._btnList["b4"] = new PageButton(this._page.div.getElementsByClassName("b4").item(0) as HTMLDivElement);
		this._btnList["back"] = new PageButton(Page.backDiv);
		this._btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc();}

		if(this._btnList["b1"].trigger){
			this._btnList["b1"].trigger = false;
			Page.transitionsPage("world");
		}

		if(this._btnList["back"].trigger){
			this._btnList["back"].trigger = false;
			// トップに戻る
			dom.document.location.href = "/top";
		}

		return true;
	}

	// 描画
	override function draw() : void{
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

