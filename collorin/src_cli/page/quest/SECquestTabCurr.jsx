import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/SECpopupMenu.jsx";

import "QuestPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECquestTabCurr extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div style="width:280px;margin:20px;font-size:12px;">
			•クエストについて<br>
			特殊な条件を満たすとクエストが現れる。
			このページで受注することによってクエストを進行することができ、五つまで同時進行できる。
			クエストをクリアすることによってアイテムを手に入れ、ムービーを見ることができる。
			条件は以下の通り。<br>
			○発生条件: キャラクターの入手<br>
			○発生条件: 特定のステージ進入<br>
			○発生条件: イベントログイン<br>
			○発生条件: 親クエストクリア<br>
			○達成条件: アイテムを規定数納品する<br>
			○達成条件: 敵を規定数倒す<br>
			○達成条件: 規定チーム編成<br>
		</div>
	""";

	var _page : QuestPage;
	var _btnList : Map.<PartsButton>;
	var _data : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : QuestPage, response : variant){
		this._page = page;
		this._data = response;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = SECquestTabCurr._htmlTag;
			this._page.bodyDiv.className = "body curr";
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["curr"] = new PartsButton(this._page.tabCurrDiv, true);
		this._btnList["fine"] = new PartsButton(this._page.tabFineDiv, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// タブボタン
		if(this._btnList["fine"].trigger){this._page.toggleTab("fine"); return false;}

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

