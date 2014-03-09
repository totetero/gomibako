import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";

import "SECcharaTabList.jsx";
import "SECcharaTabTeam.jsx";
import "SECcharaTabRest.jsx";
import "SECcharaTabPwup.jsx";
import "SECcharaTabSell.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class CharaPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div class="body"></div>
		<div class="tabContainer">
			<div class="tab list">一覧</div>
			<div class="tab team">編成</div>
			<div class="tab rest">休息</div>
			<div class="tab pwup">強化</div>
			<div class="tab sell">別れ</div>
		</div>
	""";

	// ボディ要素
	var bodyDiv : HTMLDivElement;
	// タブ要素
	var tabListDiv : HTMLDivElement;
	var tabTeamDiv : HTMLDivElement;
	var tabRestDiv : HTMLDivElement;
	var tabPwupDiv : HTMLDivElement;
	var tabSellDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "chara";
		this.depth = 11;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chara";
		this.div.innerHTML = CharaPage._htmlTag;
		// DOM獲得
		this.bodyDiv = this.div.getElementsByClassName("body").item(0) as HTMLDivElement;
		this.tabListDiv = this.div.getElementsByClassName("tab list").item(0) as HTMLDivElement;
		this.tabTeamDiv = this.div.getElementsByClassName("tab team").item(0) as HTMLDivElement;
		this.tabRestDiv = this.div.getElementsByClassName("tab rest").item(0) as HTMLDivElement;
		this.tabPwupDiv = this.div.getElementsByClassName("tab pwup").item(0) as HTMLDivElement;
		this.tabSellDiv = this.div.getElementsByClassName("tab sell").item(0) as HTMLDivElement;

		// イベント設定
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("キャラクター", 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.toggleTab("list");
	}

	// ----------------------------------------------------------------
	// タブきりかえ SECの登録
	function toggleTab(tab : string) : void{
		this.bodyDiv.innerHTML = "";
		this.tabListDiv.className = "tab list" + ((tab == "list") ? " select" : "");
		this.tabTeamDiv.className = "tab team" + ((tab == "team") ? " select" : "");
		this.tabRestDiv.className = "tab rest" + ((tab == "rest") ? " select" : "");
		this.tabPwupDiv.className = "tab pwup" + ((tab == "pwup") ? " select" : "");
		this.tabSellDiv.className = "tab sell" + ((tab == "sell") ? " select" : "");
		switch(tab){
			case "list":
				this.serialPush(new SECload("/chara/list", null, function(response : variant) : void{
					this.serialPush(new SECcharaTabList(this, response));
				}));
				break;
			case "team":
				this.serialPush(new SECload("/chara/team", null, function(response : variant) : void{
					this.serialPush(new SECcharaTabTeam(this, response));
				}));
				break;
			case "rest":
				this.serialPush(new SECload("/chara/rest", null, function(response : variant) : void{
					this.serialPush(new SECcharaTabRest(this, response));
				}));
				break;
			case "pwup":
				this.serialPush(new SECload("/chara/pwup", null, function(response : variant) : void{
					this.serialPush(new SECcharaTabPwup(this, response));
				}));
				break;
			case "sell":
				this.serialPush(new SECload("/chara/sell", null, function(response : variant) : void{
					this.serialPush(new SECcharaTabSell(this, response));
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

