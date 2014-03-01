import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<div class="navi">
			<div class="core-btn world">ワールド</div>
			<div class="core-btn quest">クエスト</div>
			<div class="core-btn chara">キャラクター</div>
			<div class="core-btn item">アイテム</div>
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
		this.serialPush(new SECload("/mypage", null, function(response : variant) : void{
			// ロード完了 データの形成
			log response;
		}));
		this.serialPush(new ECone(function() : void{
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
	var _btnList : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : MyPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this._btnList = {} : Map.<PageButton>;
		this._btnList["world"] = new PageButton(this._page.div.getElementsByClassName("core-btn world").item(0) as HTMLDivElement, true);
		this._btnList["quest"] = new PageButton(this._page.div.getElementsByClassName("core-btn quest").item(0) as HTMLDivElement, true);
		this._btnList["chara"] = new PageButton(this._page.div.getElementsByClassName("core-btn chara").item(0) as HTMLDivElement, true);
		this._btnList["item"] = new PageButton(this._page.div.getElementsByClassName("core-btn item").item(0) as HTMLDivElement, true);
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// コンテンツボタン
		if(this._btnList["world"].trigger){Page.transitionsPage("world");}
		if(this._btnList["quest"].trigger){Page.transitionsPage("quest");}
		if(this._btnList["chara"].trigger){Page.transitionsPage("chara");}
		if(this._btnList["item"].trigger){Page.transitionsPage("item");}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){dom.document.location.href = "/top";}

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

