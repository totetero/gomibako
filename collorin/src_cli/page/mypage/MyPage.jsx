import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<div class="navi">
			<div class="core-btn b1">ワールド</div>
			<div class="core-btn b2">クエスト</div>
			<div class="core-btn b3">キャラクター</div>
			<div class="core-btn b4">アイテム</div>
		</div>

		<div class="footer">おしらせバナースペース</div>
	""";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "マイページ";
		this.depth = 1;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page mypage";
		this.div.innerHTML = this._htmlTag;

		// イベント設定
		this.serialPush(new SECloadPage("/mypage", null, function(response : variant) : void{
			// データの形成
			log response;
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 1));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECmyPageMain(this));
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

class SECmyPageMain extends EventCartridge{
	var _page : MyPage;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : MyPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this._btnList["b1"] = new PageButton(this._page.div.getElementsByClassName("core-btn b1").item(0) as HTMLDivElement, true);
		this._btnList["b2"] = new PageButton(this._page.div.getElementsByClassName("core-btn b2").item(0) as HTMLDivElement, true);
		this._btnList["b3"] = new PageButton(this._page.div.getElementsByClassName("core-btn b3").item(0) as HTMLDivElement, true);
		this._btnList["b4"] = new PageButton(this._page.div.getElementsByClassName("core-btn b4").item(0) as HTMLDivElement, true);
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

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

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

