import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopupMenu.jsx";

import "QuestPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECquestTabFine extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:280px;margin:20px;font-size:12px;">
			•完了シナリオについて<br>
			クリア済みのクエストはここで確認することができる。
			一度見たムービーをもう一度見直すことができる。
			デイリークエストなどは表示しない。
		</div>
	""";

	var _page : QuestPage;
	var _btnList : Map.<PartsButton>;
	var _data : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : QuestPage, response : variant){
		this._page = page;
		this._data = response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(this._page.bodyDiv.className.indexOf("fine") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.className = "body fine";
			this._page.bodyDiv.innerHTML = SECquestTabFine._htmlTag;
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["curr"] = new PartsButton(this._page.tabCurrDiv, true);
		this._btnList["fine"] = new PartsButton(this._page.tabFineDiv, true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["curr"].trigger){Sound.playSE("ok"); this._page.toggleTab("curr"); return false;}

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

