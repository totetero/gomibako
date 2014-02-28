import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabList extends EventCartridge{
	var _page : CharaPage;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		this._btnList["list"] = new PageButton(this._page.listDiv, true);
		this._btnList["team"] = new PageButton(this._page.teamDiv, true);
		this._btnList["rest"] = new PageButton(this._page.restDiv, true);
		this._btnList["pwup"] = new PageButton(this._page.pwupDiv, true);
		this._btnList["sell"] = new PageButton(this._page.sellDiv, true);
		this._page.listDiv.className = "list select";
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["back"].trigger){
			Page.transitionsPage("mypage");
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._page.listDiv.className = "list";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

