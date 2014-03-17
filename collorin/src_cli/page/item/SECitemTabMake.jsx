import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/SECpopupMenu.jsx";

import "ItemPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECitemTabMake extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:280px;margin:20px;font-size:12px;background-color:rgba(255,255,255,0.5);">
			•作成について<br>
			アイテム合成素材を組み合わせることにより
			別のアイテムを作ることができる。
			レシピはクエストクリアなどで手に入る。
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
			this._page.bodyDiv.innerHTML = SECitemTabMake._htmlTag;
			this._page.bodyDiv.className = "body make";
			this._page.pickLabelDiv.innerHTML = "ふが";
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
		if(this._btnList["list"].trigger){Sound.playSE("ok"); this._page.toggleTab("list"); return false;}
		if(this._btnList["shop"].trigger){Sound.playSE("ok"); this._page.toggleTab("shop"); return false;}

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

