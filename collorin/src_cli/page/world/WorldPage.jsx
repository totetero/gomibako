import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class WorldPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-btn b1">テストステージ</div>
		<div class="core-btn b2">チャットステージ</div>
	""";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "ワールド";
		this.depth = 2;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page world";
		this.div.innerHTML = this._htmlTag;

		// イベント設定
		this.serialPush(new SECloadPage("/world", null, function(response : variant) : void{
			// データの形成
			log response;
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECworldPageMain(this));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECworldPageMain extends EventCartridge{
	var _page : WorldPage;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : WorldPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this._btnList["btn1"] = new PageButton(this._page.div.getElementsByClassName("core-btn b1").item(0) as HTMLDivElement, true);
		this._btnList["btn2"] = new PageButton(this._page.div.getElementsByClassName("core-btn b2").item(0) as HTMLDivElement, true);
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["btn1"].trigger){
			this._btnList["btn1"].trigger = false;
			Page.transitionsPage("dice");
		}

		if(this._btnList["btn2"].trigger){
			this._btnList["btn2"].trigger = false;
			Page.transitionsPage("chat");
		}

		if(this._btnList["back"].trigger){
			this._btnList["back"].trigger = false;
			Page.transitionsPage("mypage");
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

