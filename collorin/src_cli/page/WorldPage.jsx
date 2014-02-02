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
	var _htmlTag = """
		<div class="btn">テストステージ</div>
	""";

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page world";
		this.div.innerHTML = this._htmlTag;
		// プロパティ設定
		this.name = "ワールド";
		this.depth = 2;
		this.headerType = 2;

		// イベント設定
		this.serialPush(new SECloadPage("/world", null, function(response : variant) : void{
			// データの形成
			log response;
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECworldPageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class SECworldPageMain extends EventCartridge{
	var _page : WorldPage;
	var _btnList = {} : Map.<PageButton>;

	// コンストラクタ
	function constructor(page : WorldPage){
		this._page = page;
		this._btnList["btn"] = new PageButton(this._page.div.getElementsByClassName("btn").item(0) as HTMLDivElement);
		this._btnList["back"] = new PageButton(Page.backDiv);
		this._btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc();}

		if(this._btnList["btn"].trigger){
			this._btnList["btn"].trigger = false;
			Page.transitionsPage("game");
		}

		if(this._btnList["back"].trigger){
			this._btnList["back"].trigger = false;
			Page.transitionsPage("mypage");
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

