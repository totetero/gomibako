import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/SECpopupMenu.jsx";

import "ItemPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECitemTabShop extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:280px;margin:20px;font-size:12px;background-color:rgba(255,255,255,0.5);">
			•購入について<br>
			課金ショップ 以下のようなものを販売する<br>
			○SP回復アイテム<br>
			○ステージ中SP回復アイテム<br>
			○ステージ中復活アイテム<br>
			○HP回復時短アイテム<br>
			○HP回復ベッド増加アイテム<br>
			○キャラクター福袋<br>
			○使い捨てさいころ増加装備<br>
		</div>
	""";

	var _page : ItemPage;
	var _btnList : Map.<PartsButton>;
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
			this._page.bodyDiv.innerHTML = SECitemTabShop._htmlTag;
			this._page.bodyDiv.className = "body shop";
			this._page.pickLabelDiv.innerHTML = "ぴよ";
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["list"] = new PartsButton(this._page.tabListDiv, true);
		this._btnList["make"] = new PartsButton(this._page.tabMakeDiv, true);
		this._btnList["shop"] = new PartsButton(this._page.tabShopDiv, true);
		this._btnList["pick"] = new PartsButton(this._page.pickDiv, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["list"].trigger){this._page.toggleTab("list"); return false;}
		if(this._btnList["make"].trigger){this._page.toggleTab("make"); return false;}

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

