import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";

import "SECcharaTabList.jsx";

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
		var tabDiv = this.div.getElementsByClassName("tab").item(0);
		this.listDiv = tabDiv.getElementsByClassName("list").item(0) as HTMLDivElement;
		this.teamDiv = tabDiv.getElementsByClassName("team").item(0) as HTMLDivElement;
		this.restDiv = tabDiv.getElementsByClassName("rest").item(0) as HTMLDivElement;
		this.pwupDiv = tabDiv.getElementsByClassName("pwup").item(0) as HTMLDivElement;
		this.sellDiv = tabDiv.getElementsByClassName("sell").item(0) as HTMLDivElement;

		// イベント設定
		this.serialPush(new SECload("/chara", null, function(response : variant) : void{
			// ロード完了 データの形成
			log response;
		}));
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 2));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECcharaTabList(this));
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

