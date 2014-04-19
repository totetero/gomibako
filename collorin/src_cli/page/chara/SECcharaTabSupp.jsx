import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/PartsScroll.jsx";
import "../core/PartsCharacter.jsx";
import "../core/SECload.jsx";
import "../core/SECpopupMenu.jsx";
import "../core/SECpopupPicker.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabSupp extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow cssimg_core_picker_arrow"></div></div>
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
	var _sortPicker : SECpopupPicker;
	var _charaList : PartsCharaListItem[];
	var _prevtag = "";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this._parse(response);

		// 並べ替え要素作成
		this._sortPicker = new SECpopupPicker("並べ替え", [
			new SECpopupPickerItem("sp", "SP消費順"),
			new SECpopupPickerItem("team", "チーム順"),
			new SECpopupPickerItem("level", "レベル順"),
			new SECpopupPickerItem("type", "種類順"),
			new SECpopupPickerItem("new", "新着順"),
		]);
		this._sortPicker.getItem("sp").selected = true;
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function _parse(response : variant) : void{
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		this._charaList = new PartsCharaListItem[];
		for(var i = 0; i < list.length; i++){
			this._charaList.push(new PartsCharaListItem(list[i]));
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(this._page.bodyDiv.className.indexOf("supp") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.className = "body supp";
			this._page.bodyDiv.innerHTML = SECcharaTabSupp._htmlTag;

			this._scroller = null;
		}
		var pickDiv = this._page.bodyDiv.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var scrollDiv = this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// ピッカー設定
		var selectedItem = this._sortPicker.getSelectedItem();
		(pickDiv.getElementsByClassName("core-picker-label").item(0) as HTMLDivElement).innerHTML = selectedItem.name;
		if(this._prevtag != selectedItem.tag){
			this._prevtag = selectedItem.tag;
			PartsCharaListItem.sort(this._charaList, selectedItem.tag);
			// ソート時スクロールリセット
			if(this._scroller != null){this._scroller.scrolly = 0;}
		}
		// キャラクターリスト作成
		scrollDiv.innerHTML = "";
		for(var i = 0; i < this._charaList.length; i++){
			scrollDiv.appendChild(this._charaList[i].bodyDiv);
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
				Sound.playSE("ok");
				btn.trigger = false;
				item.select = !this._charaList[i].select;
			}

			// アイコンボタン
			var btn = this._scroller.btnList["charaIcon" + i];
			if(btn.trigger){
				Sound.playSE("ok");
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
			Sound.playSE("ok");
			this._page.serialPush(new SECload("/chara/supp", null, function(response : variant) : void{this._parse(response);}));
			this._page.serialPush(this);
			return false;
		}

		// 並べ替えピッカーボタン
		if(this._btnList["pick"].trigger){Sound.playSE("ok"); this._page.serialPush(this._sortPicker.beforeOpen(this._page, this)); return false;}

		// タブボタン
		if(this._btnList["team"].trigger){Sound.playSE("ok"); this._page.toggleTab("team"); return false;}
		if(this._btnList["rest"].trigger){Sound.playSE("ok"); this._page.toggleTab("rest"); return false;}
		if(this._btnList["pwup"].trigger){Sound.playSE("ok"); this._page.toggleTab("pwup"); return false;}
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

