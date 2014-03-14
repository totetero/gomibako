import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/SECpopupMenu.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabRest extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:230px;margin:20px;margin-top:68px;font-size:12px;">
			•休息について<br>
			補給アイテムと時間を消費することによってHPを回復することができる。
			HPは敵からダメージを受けると減る値であり、回復手段は多くない。
			回復時間と必要な補給アイテムはキャラクターやレベルに応じて変わる。
			補給アイテムは汎用と専用の2種類あり、
			汎用は回復時間が長くかかるが、入手しやすく時間経過でも手に入る。基本余らせる。
			専用はキャラ毎に異なり入手に手間がかかるが、HPの上限を少し超えて回復することができる。
			HPの回復はベッド単位でおこない、ベッドが埋まっていると次の回復ができない。
			時短アイテムとベッドを増やすアイテムをショップで販売する。
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
			this._page.bodyDiv.innerHTML = SECcharaTabRest._htmlTag;
			this._page.bodyDiv.className = "body rest";
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
		if(this._btnList["team"].trigger){this._page.toggleTab("team"); return false;}
		if(this._btnList["supp"].trigger){this._page.toggleTab("supp"); return false;}
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

