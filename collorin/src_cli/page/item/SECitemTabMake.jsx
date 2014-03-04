import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/SECpopupMenu.jsx";

import "ItemPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECitemTabMake extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="test">かきくけこ</div>
	""";

	var _page : ItemPage;
	var _btnList : Map.<PageButton>;
	var _data : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ItemPage, response : variant){
		this._page = page;
		this._data = response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = this._htmlTag;
			this._page.bodyDiv.className = "body make";
			this._page.pickLabelDiv.innerHTML = "ふが";
		}

		// ボタン作成
		this._btnList = {} : Map.<PageButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PageButton(Page.backDiv, true);
		this._btnList["menu"] = new PageButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["list"] = new PageButton(this._page.tabListDiv, true);
		this._btnList["make"] = new PageButton(this._page.tabMakeDiv, true);
		this._btnList["shop"] = new PageButton(this._page.tabShopDiv, true);
		this._btnList["pick"] = new PageButton(this._page.pickDiv, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["list"].trigger){this._page.toggleTab("list"); return false;}
		if(this._btnList["shop"].trigger){this._page.toggleTab("shop"); return false;}

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

