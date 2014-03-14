import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/PartsScroll.jsx";
import "../page/PartsCharacter.jsx";
import "../page/SECload.jsx";
import "../page/SECpopupMenu.jsx";
import "../page/SECpopupPicker.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabSupp extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow"></div></div>
		<div class="core-btn supply">補給</div>
		<div class="scrollContainerContainer">
			<div class="scrollContainerBorder">
				<div class="scrollContainer">
					<div class="scroll"></div>
					<div class="core-ybar"></div>
				</div>
			</div>
		</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _picker : SECpopupPicker;
	var _charaList : PartsCharaListItem[];
	var _update : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this.parse(response);

		// 並べ替え要素作成
		this._picker = new SECpopupPicker("並べ替え", [
			new SECpopupPickerItem("test1", "新着順"),
			new SECpopupPickerItem("test2", "Lv順"),
			new SECpopupPickerItem("test3", "atk順"),
			new SECpopupPickerItem("test4", "grd順"),
			new SECpopupPickerItem("test5", "luk順"),
		]);
		this._picker.getItem("test1").selected = true;
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		this._update = true;
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		this._charaList = new PartsCharaListItem[];
		for(var i = 0; i < list.length; i++){
			this._charaList.push(new PartsCharaListItem(list[i]));
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.className.indexOf("supp") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = SECcharaTabSupp._htmlTag;
			this._page.bodyDiv.className = "body supp";

			this._scroller = null;
		}
		var pickDiv = this._page.bodyDiv.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var scrollDiv = this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// ピッカー設定
		var tag = this._picker.setLabel(pickDiv);
		if(this._update){this._update = false; if(tag == ""){tag = this._picker.getTag();}}
		if(tag != ""){
			// ピッカーの選択されている要素が変わった場合
			PartsCharaListItem.sort(this._charaList as PartsCharaListItem[], tag);
			// キャラクターリスト作成
			scrollDiv.innerHTML = "";
			for(var i = 0; i < this._charaList.length; i++){
				scrollDiv.appendChild(this._charaList[i].bodyDiv);
			}
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
		// 本体ボタン
		this._btnList["pick"] = new PartsButton(pickDiv, true);
		this._btnList["supply"] = new PartsButton(this._page.bodyDiv.getElementsByClassName("core-btn").item(0) as HTMLDivElement, true);

		// スクロール作成
		if(this._scroller == null){
			this._scroller = new PartsScroll(
				this._page.bodyDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
				scrollDiv,
				null,
				this._page.bodyDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._charaList.length; i++){
			var itemBtn = new PartsButton(this._charaList[i].bodyDiv, true);
			var iconBtn = new PartsButton(this._charaList[i].iconDiv, true);
			this._scroller.btnList["charaItem" + i] = itemBtn;
			this._scroller.btnList["charaIcon" + i] = iconBtn;
			itemBtn.children = [iconBtn.div];
		}

		// 補給ボタン設定
		var count = 0;
		for(var i = 0; i < this._charaList.length; i++){if(this._charaList[i].select){count++;}}
		this._btnList["supply"].inactive = !(count > 0);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// キャラクターリストボタン
		var count = 0;
		for(var i = 0; i < this._charaList.length; i++){
			var item = this._charaList[i];

			// 要素ボタン
			var btn = this._scroller.btnList["charaItem" + i];
			if(btn.trigger){
				btn.trigger = false;
				item.select = !this._charaList[i].select;
			}

			// アイコンボタン
			var btn = this._scroller.btnList["charaIcon" + i];
			if(btn.trigger){
				this._page.serialPush(new SECpopupInfoChara(this._page, this, item));
				return false;
			}

			if(item.select){count++;}

			// 選択状態描画
			var div = item.bodyDiv;
			var isSelect = div.className.indexOf(" select") >= 0;
			if(item.select && !isSelect){div.className += " select";}
			else if(!item.select && isSelect){div.className = div.className.replace(/ select/g , "");}
		}

		// 補給ボタン
		var btn = this._btnList["supply"];
		btn.inactive = !(count > 0);
		if(btn.trigger){
			// テスト とりあえず通信
			this._page.serialPush(new SECload("/chara/supp", null, function(response : variant) : void{this.parse(response);}));
			this._page.serialPush(this);
			return false;
		}

		// 並べ替えピッカーボタン
		if(this._btnList["pick"].trigger){this._page.serialPush(this._picker.beforeOpen(this._page, this)); return false;}

		// タブボタン
		if(this._btnList["team"].trigger){this._page.toggleTab("team"); return false;}
		if(this._btnList["rest"].trigger){this._page.toggleTab("rest"); return false;}
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

