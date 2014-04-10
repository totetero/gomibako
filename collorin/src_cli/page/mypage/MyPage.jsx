import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/Transition.jsx";
import "../core/SECload.jsx";
import "../core/SECpopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
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
		this.type = "mypage";
		this.depth = 1;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page mypage";
		this.div.innerHTML = MyPage._htmlTag;

		// イベント設定
		this.serialPush(new SECload("/mypage", null, function(response : variant) : void{
			// ロード完了 データの形成
			log response;
		}));
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("マイページ", 1));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
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
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : MyPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["world"] = new PartsButton(this._page.div.getElementsByClassName("core-btn world").item(0) as HTMLDivElement, true);
		this._btnList["quest"] = new PartsButton(this._page.div.getElementsByClassName("core-btn quest").item(0) as HTMLDivElement, true);
		this._btnList["chara"] = new PartsButton(this._page.div.getElementsByClassName("core-btn chara").item(0) as HTMLDivElement, true);
		this._btnList["item"] = new PartsButton(this._page.div.getElementsByClassName("core-btn item").item(0) as HTMLDivElement, true);
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// コンテンツボタン
		if(this._btnList["world"].trigger){Sound.playSE("ok"); Page.transitionsPage("world");}
		if(this._btnList["quest"].trigger){Sound.playSE("ok"); Page.transitionsPage("quest");}
		if(this._btnList["chara"].trigger){Sound.playSE("ok"); Page.transitionsPage("chara");}
		if(this._btnList["item"].trigger){Sound.playSE("ok"); Page.transitionsPage("item");}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){this._btnList["back"].trigger = false; dom.document.location.href = "/top";}

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

