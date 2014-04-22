import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/PartsScroll.jsx";
import "../core/PartsItem.jsx";
import "../core/SECpopupMenu.jsx";
import "../core/SECpopupPicker.jsx";

import "ItemPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECitemTabList extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div class="scrollContainer">
			<div class="scroll">
				<div style="width:280px;margin:20px;font-size:12px;background-color:rgba(255,255,255,0.5);">
					•アイテムについて<br>
					以下の種類のアイテムが存在する。<br>
					○補給アイテム HPやSPの回復素材<br>
					○装備アイテム ステージで使用する<br>
					○アイテム合成素材<br>
					○キャラクター進化素材<br>
					○福袋 ガチャ的アイテム<br>
					○さいころ装飾アイテム<br>
					○イベントキーアイテム 含フレーバー<br>
				</div>
			</div>
			<div class="core-xbar"></div>
		</div>
	""";

	var _page : ItemPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _sortPicker : SECpopupPicker;
	var _itemList : PartsItemListItem[];
	var _prevtag = "";
	var _prevRowNum = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ItemPage, response : variant){
		this._page = page;
		this._parse(response);

		// 並べ替え要素作成
		this._sortPicker = new SECpopupPicker("並べ替え", [
			new SECpopupPickerItem("new", "新着順"),
			new SECpopupPickerItem("hoge", "ほげ"),
			new SECpopupPickerItem("fuga", "ふが"),
			new SECpopupPickerItem("myon", "みょん"),
			
		]);
		this._sortPicker.getItem("new").selected = true;
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function _parse(response : variant) : void{
		// test
		this._itemList = new PartsItemListItem[];
		this._itemList.push(new PartsItemListItem({name: "文字数８文字まで", num: 30}));
		this._itemList.push(new PartsItemListItem({name: "文字数オーバーテス", num: 999999}));
		for(var i = 0; i < 9; i++){this._itemList.push(new PartsItemListItem({name: "テスト", num: 1}));}

	}

	// ----------------------------------------------------------------
	// 要素サイズ確認と調整
	function _checkBodySize(force : boolean) : void{
		// アイテムリストサイズ変更確認と変更時アイテムリスト作成
		var maxHeight = Ctrl.sh - 106 - 6;
		var rowNum = Math.floor((maxHeight - 15) / 50);
		if(force || this._prevRowNum != rowNum){
			var scrollDiv = this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;
			this._prevRowNum = rowNum = Math.min(this._itemList.length, rowNum);
			var colNum = Math.ceil(this._itemList.length / rowNum);
			this._page.bodyDiv.style.height = (rowNum * 50 + 15) + "px";
			scrollDiv.style.width = (colNum * 185 + 15) + "px";
			// アイテムリスト作成
			scrollDiv.innerHTML = "";
			for(var i = 0; i < this._itemList.length; i++){
				// 市松模様調整
				if(i != 0 && (i % rowNum == 0) && (rowNum % 2 == 0)){scrollDiv.appendChild(dom.document.createElement("div"));}
				// アイテム追加
				this._itemList[i].bodyDiv.style.left = (10 + 185 * Math.floor(i / rowNum)) + "px";
				this._itemList[i].bodyDiv.style.top = (10 + 50 * (i % rowNum)) + "px";
				scrollDiv.appendChild(this._itemList[i].bodyDiv);
			}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(this._page.bodyDiv.className.indexOf("list") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.className = "body list";
			this._page.bodyDiv.innerHTML = SECitemTabList._htmlTag;

			this._scroller = null;
		}

		// ピッカー設定
		var selectedItem = this._sortPicker.getSelectedItem();
		(this._page.pickDiv.getElementsByClassName("core-picker-label").item(0) as HTMLDivElement).innerHTML = selectedItem.name;
		if(this._prevtag != selectedItem.tag){
			this._prevtag = selectedItem.tag;
			PartsItemListItem.sort(this._itemList, selectedItem.tag);
			// ソート時スクロールリセット
			if(this._scroller != null){this._scroller.scrollx = 0;}
			// アイテムリスト再描画
			this._checkBodySize(true);
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["list"] = new PartsButton(this._page.tabListDiv, true);
		this._btnList["make"] = new PartsButton(this._page.tabMakeDiv, true);
		this._btnList["shop"] = new PartsButton(this._page.tabShopDiv, true);
		// 本体ボタン
		this._btnList["pick"] = new PartsButton(this._page.pickDiv, true);

		// スクロール作成
		if(this._scroller == null){
			this._scroller = new PartsScroll(
				this._page.bodyDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
				this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement,
				this._page.bodyDiv.getElementsByClassName("core-xbar").item(0) as HTMLDivElement,
				null
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._itemList.length; i++){
			var itemBtn = new PartsButton(this._itemList[i].bodyDiv, true);
			var iconBtn = new PartsButton(this._itemList[i].iconDiv, true);
			this._scroller.btnList["itemItem" + i] = itemBtn;
			this._scroller.btnList["itemIcon" + i] = iconBtn;
			itemBtn.children = [iconBtn.div];
			itemBtn.inactive = true;
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// 要素サイズ確認
		this._checkBodySize(false);

		// アイテムリストボタン
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];

			// アイコンボタン
			var btn = this._scroller.btnList["itemIcon" + i];
			if(btn.trigger){
				Sound.playSE("ok");
				this._page.serialPush(new SECpopupInfoItem(this._page, this, item));
				return false;
			}

			// 軽量化のために見えない要素は非表示
			var position = Math.floor(i / this._prevRowNum) * 185 + 10 + this._scroller.scrollx;
			var pickerSize = 320;
			var display = (-185 < position && position < pickerSize) ? "block" : "none";
			if(item.bodyDiv.style.display != display){
				item.bodyDiv.style.display = display;
			}
		}

		// 並べ替えピッカーボタン
		if(this._btnList["pick"].trigger){Sound.playSE("ok"); this._page.serialPush(this._sortPicker.beforeOpen(this._page, this)); return false;}

		// タブボタン
		if(this._btnList["make"].trigger){Sound.playSE("ok"); this._page.toggleTab("make"); return false;}
		if(this._btnList["shop"].trigger){Sound.playSE("ok"); this._page.toggleTab("shop"); return false;}

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

