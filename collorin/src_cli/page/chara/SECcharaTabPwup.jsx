import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/SECpopupMenu.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabPwup extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="test">たちつてと</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PageButton>;
	var _data : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this._data = response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = this._htmlTag;
		}

		this._btnList = {} : Map.<PageButton>;
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		this._btnList["list"] = new PageButton(this._page.tabListDiv, true);
		this._btnList["team"] = new PageButton(this._page.tabTeamDiv, true);
		this._btnList["rest"] = new PageButton(this._page.tabRestDiv, true);
		this._btnList["pwup"] = new PageButton(this._page.tabPwupDiv, true);
		this._btnList["sell"] = new PageButton(this._page.tabSellDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["list"].trigger){this._page.toggleTab("list"); return false;}
		if(this._btnList["team"].trigger){this._page.toggleTab("team"); return false;}
		if(this._btnList["rest"].trigger){this._page.toggleTab("rest"); return false;}
		if(this._btnList["sell"].trigger){this._page.toggleTab("sell"); return false;}

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

