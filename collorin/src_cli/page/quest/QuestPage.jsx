import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";

import "SECquestTabCurr.jsx";
import "SECquestTabFine.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class QuestPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div class="bodyContainer"><div class="body"></div></div>
		<div class="tab curr">進行可能</div>
		<div class="tab fine">完了シナリオ</div>
	""";

	// ボディ要素
	var bodyDiv : HTMLDivElement;
	// タブ要素
	var tabCurrDiv : HTMLDivElement;
	var tabFineDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "quest";
		this.depth = 11;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page quest";
		this.div.innerHTML = QuestPage._htmlTag;
		// DOM獲得
		this.bodyDiv = this.div.getElementsByClassName("body").item(0) as HTMLDivElement;
		this.tabCurrDiv = this.div.getElementsByClassName("tab curr").item(0) as HTMLDivElement;
		this.tabFineDiv = this.div.getElementsByClassName("tab fine").item(0) as HTMLDivElement;

		// イベント設定
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("クエスト", 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.toggleTab("curr");
	}

	// ----------------------------------------------------------------
	// タブきりかえ SECの登録
	function toggleTab(tab : string) : void{
		this.bodyDiv.innerHTML = "";
		this.tabCurrDiv.className = "tab curr" + ((tab == "curr") ? " select" : "");
		this.tabFineDiv.className = "tab fine" + ((tab == "fine") ? " select" : "");
		switch(tab){
			case "curr":
				this.serialPush(new SECload("/quest/curr", null, function(response : variant) : void{
					this.serialPush(new SECquestTabCurr(this, response));
				}));
				break;
			case "fine":
				this.serialPush(new SECload("/quest/fine", null, function(response : variant) : void{
					this.serialPush(new SECquestTabFine(this, response));
				}));
				break;
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

