import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/SECpopupMenu.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabSell extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:230px;margin:20px;margin-top:68px;font-size:12px;">
			•別れについて<br>
			キャラクターと別れることによりアイテムを手に入れることができる。
			手に入るアイテムはキャラクターや進化状態で異なり、
			別れでしか手に入らないアイテムも用意する。
		</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PartsButton>;
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
			this._page.bodyDiv.innerHTML = SECcharaTabSell._htmlTag;
			this._page.bodyDiv.className = "body sell";
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["team"] = new PartsButton(this._page.tabTeamDiv, true);
		this._btnList["supp"] = new PartsButton(this._page.tabSuppDiv, true);
		this._btnList["rest"] = new PartsButton(this._page.tabRestDiv, true);
		this._btnList["pwup"] = new PartsButton(this._page.tabPwupDiv, true);
		this._btnList["sell"] = new PartsButton(this._page.tabSellDiv, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["team"].trigger){Sound.playSE("ok"); this._page.toggleTab("team"); return false;}
		if(this._btnList["supp"].trigger){Sound.playSE("ok"); this._page.toggleTab("supp"); return false;}
		if(this._btnList["rest"].trigger){Sound.playSE("ok"); this._page.toggleTab("rest"); return false;}
		if(this._btnList["pwup"].trigger){Sound.playSE("ok"); this._page.toggleTab("pwup"); return false;}

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

