import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";

import "SECitemTabList.jsx";
import "SECitemTabMake.jsx";
import "SECitemTabShop.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class ItemPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div>
		<div class="body"></div>
		<div class="tab list">一覧</div>
		<div class="tab make">作成</div>
		<div class="tab shop">購入</div>
	""";

	// ボディ要素
	var bodyDiv : HTMLDivElement;
	// 並べ替え要素
	var pickDiv : HTMLDivElement;
	var pickLabelDiv : HTMLDivElement;
	// タブ要素
	var tabListDiv : HTMLDivElement;
	var tabMakeDiv : HTMLDivElement;
	var tabShopDiv : HTMLDivElement;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "item";
		this.depth = 11;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page item";
		this.div.innerHTML = ItemPage._htmlTag;
		// DOM獲得
		this.bodyDiv = this.div.getElementsByClassName("body").item(0) as HTMLDivElement;
		this.pickDiv = this.div.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		this.pickLabelDiv = this.pickDiv.getElementsByClassName("core-picker-label").item(0) as HTMLDivElement;
		this.tabListDiv = this.div.getElementsByClassName("tab list").item(0) as HTMLDivElement;
		this.tabMakeDiv = this.div.getElementsByClassName("tab make").item(0) as HTMLDivElement;
		this.tabShopDiv = this.div.getElementsByClassName("tab shop").item(0) as HTMLDivElement;

		// イベント設定
		this.serialPush(new ECone(function() : void{
			// コントローラー展開
			this.parallelPush(new PECopenHeader("アイテム", 2));
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
		this.tabMakeDiv.className = "tab make" + ((tab == "make") ? " select" : "");
		this.tabShopDiv.className = "tab shop" + ((tab == "shop") ? " select" : "");
		switch(tab){
			case "list":
				this.serialPush(new SECload("/item/list", null, function(response : variant) : void{
					this.serialPush(new SECitemTabList(this, response));
				}));
				break;
			case "make":
				this.serialPush(new SECload("/item/make", null, function(response : variant) : void{
					this.serialPush(new SECitemTabMake(this, response));
				}));
				break;
			case "shop":
				this.serialPush(new SECload("/item/shop", null, function(response : variant) : void{
					this.serialPush(new SECitemTabShop(this, response));
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

