import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/SECpopupMenu.jsx";

import "QuestPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECquestTabFine extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="test">かきくけこ</div>
	""";

	var _page : QuestPage;
	var _btnList : Map.<PageButton>;
	var _data : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : QuestPage, response : variant){
		this._page = page;
		this._data = response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = this._htmlTag;
			this._page.bodyDiv.className = "body fine";
		}

		this._btnList = {} : Map.<PageButton>;
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		this._btnList["curr"] = new PageButton(this._page.tabCurrDiv, true);
		this._btnList["fine"] = new PageButton(this._page.tabFineDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["curr"].trigger){this._page.toggleTab("curr"); return false;}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Page.transitionsPage("mypage");}

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

