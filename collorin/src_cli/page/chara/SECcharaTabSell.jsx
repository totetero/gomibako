import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/SECpopupMenu.jsx";

import "CharaPage.jsx";
import "SECcharaTabList.jsx";
import "SECcharaTabTeam.jsx";
import "SECcharaTabRest.jsx";
import "SECcharaTabPwup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabSell extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="test">なにぬねの</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.sellDiv.className.indexOf("select") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = this._htmlTag;
			this._page.listDiv.className = "list";
			this._page.teamDiv.className = "team";
			this._page.restDiv.className = "rest";
			this._page.pwupDiv.className = "pwup";
			this._page.sellDiv.className = "sell select";
		}
		this._btnList = {} : Map.<PageButton>;
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		this._btnList["list"] = new PageButton(this._page.listDiv, true);
		this._btnList["team"] = new PageButton(this._page.teamDiv, true);
		this._btnList["rest"] = new PageButton(this._page.restDiv, true);
		this._btnList["pwup"] = new PageButton(this._page.pwupDiv, true);
		this._btnList["sell"] = new PageButton(this._page.sellDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["list"].trigger){this._page.serialPush(new SECcharaTabList(this._page)); return false;}
		if(this._btnList["team"].trigger){this._page.serialPush(new SECcharaTabTeam(this._page)); return false;}
		if(this._btnList["rest"].trigger){this._page.serialPush(new SECcharaTabRest(this._page)); return false;}
		if(this._btnList["pwup"].trigger){this._page.serialPush(new SECcharaTabPwup(this._page)); return false;}

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

