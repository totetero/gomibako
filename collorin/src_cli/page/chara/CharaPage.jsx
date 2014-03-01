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
	var _htmlTag = """
		<div class="body"></div>
		<div class="tab">
			<div class="list">一覧</div>
			<div class="team">編成</div>
			<div class="rest">休息</div>
			<div class="pwup">強化</div>
			<div class="sell">別れ</div>
		</div>
	""";

	// ボディ要素
	var bodyDiv : HTMLDivElement;
	// タブ要素
	var listDiv : HTMLDivElement;
	var teamDiv : HTMLDivElement;
	var restDiv : HTMLDivElement;
	var pwupDiv : HTMLDivElement;
	var sellDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "キャラクター";
		this.depth = 2;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chara";
		this.div.innerHTML = this._htmlTag;
		this.bodyDiv = this.div.getElementsByClassName("body").item(0) as HTMLDivElement;
		this.listDiv = this.div.getElementsByClassName("list").item(0) as HTMLDivElement;
		this.teamDiv = this.div.getElementsByClassName("team").item(0) as HTMLDivElement;
		this.restDiv = this.div.getElementsByClassName("rest").item(0) as HTMLDivElement;
		this.pwupDiv = this.div.getElementsByClassName("pwup").item(0) as HTMLDivElement;
		this.sellDiv = this.div.getElementsByClassName("sell").item(0) as HTMLDivElement;

		// イベント設定
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.toggleTab("list");
	}

	// ----------------------------------------------------------------
	// タブきりかえ SECの登録
	function toggleTab(tab : string) : void{
		this.bodyDiv.innerHTML = "";
		this.listDiv.className = (tab == "list") ? "list select" : "list";
		this.teamDiv.className = (tab == "team") ? "team select" : "team";
		this.restDiv.className = (tab == "rest") ? "rest select" : "rest";
		this.pwupDiv.className = (tab == "pwup") ? "pwup select" : "pwup";
		this.sellDiv.className = (tab == "sell") ? "sell select" : "sell";
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

