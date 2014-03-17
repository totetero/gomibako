import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class HelpPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:280px;margin:20px;margin-top:68px;font-size:12px;">
			•ヘルプについて<br>
			あいうえお
		</div>
	""";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "help";
		this.depth = 11;
		this.bgm = "test01";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page help";
		this.div.innerHTML = HelpPage._htmlTag;

		// イベント設定
		this.serialPush(new SECload("/help", null, function(response : variant) : void{
			// ロード完了 データの形成
			log response;
		}));
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("ヘルプ", 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SEChelpPageMain(this));
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

class SEChelpPageMain extends EventCartridge{
	var _page : HelpPage;
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : HelpPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Sound.playSE("ng"); Page.transitionsPage("mypage");}

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

