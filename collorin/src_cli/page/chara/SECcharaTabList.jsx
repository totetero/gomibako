import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/SECpopupMenu.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabList extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-picker-btn"><div class="label">新着</div><div class="arrow"></div></div>
		<div class="core-btn">補給</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PageButton>;
	var _data : variant;
	// 並べ替え要素
	var pickDiv : HTMLDivElement;
	var pickLabelDiv : HTMLDivElement;
	// 補給ボタン要素
	var supplyDiv : HTMLDivElement;

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
			this._page.bodyDiv.className = "body list";
			// DOM獲得
			this.pickDiv = this._page.bodyDiv.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
			this.pickLabelDiv = this.pickDiv.getElementsByClassName("label").item(0) as HTMLDivElement;
			this.supplyDiv = this._page.bodyDiv.getElementsByClassName("core-btn").item(0) as HTMLDivElement;
		}

		this._btnList = {} : Map.<PageButton>;
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		this._btnList["list"] = new PageButton(this._page.tabListDiv, true);
		this._btnList["team"] = new PageButton(this._page.tabTeamDiv, true);
		this._btnList["rest"] = new PageButton(this._page.tabRestDiv, true);
		this._btnList["pwup"] = new PageButton(this._page.tabPwupDiv, true);
		this._btnList["sell"] = new PageButton(this._page.tabSellDiv, true);
		this._btnList["pick"] = new PageButton(this.pickDiv, true);
		this._btnList["supply"] = new PageButton(this.supplyDiv, true);
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		if(this._btnList["team"].trigger){this._page.toggleTab("team"); return false;}
		if(this._btnList["rest"].trigger){this._page.toggleTab("rest"); return false;}
		if(this._btnList["pwup"].trigger){this._page.toggleTab("pwup"); return false;}
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

