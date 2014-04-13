import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopupMenu.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabPwup extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:230px;margin:20px;margin-top:68px;font-size:12px;">
			•強化について<br>
			強化タブでは装備アイテムの装備とキャラクターの進化が行える。
			キャラクター合成はできない。
			<br><br>
			•装備について<br>
			装備アイテムの装備できる種類と数はキャラクターにより異なり、
			装備することにより能力が上昇したり、ステージ中で使うことができる。
			スキルの代わりとしての意味も持つ。
			<br><br>
			•進化について<br>
			進化アイテムを消費することによりキャラクターを進化させることができる。
			必要な進化アイテムはキャラクターにより異なる。
			キャラクターの進化先は一つではなく、分岐する。
			進化先はイベントなどによりどんどん追加する。
			また、退化をさせることもできる。
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
	override function init() : void{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.className = "body pwup";
			this._page.bodyDiv.innerHTML = SECcharaTabPwup._htmlTag;
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
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["team"].trigger){Sound.playSE("ok"); this._page.toggleTab("team"); return false;}
		if(this._btnList["supp"].trigger){Sound.playSE("ok"); this._page.toggleTab("supp"); return false;}
		if(this._btnList["rest"].trigger){Sound.playSE("ok"); this._page.toggleTab("rest"); return false;}
		if(this._btnList["sell"].trigger){Sound.playSE("ok"); this._page.toggleTab("sell"); return false;}

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

