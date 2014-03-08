import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/PartsScroll.jsx";
import "../page/SECpopupMenu.jsx";
import "../page/SECpopupPicker.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabList extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-picker-btn"><div class="label"></div><div class="arrow"></div></div>
		<div class="core-btn supply">補給</div>
		<div class="scrollContainerContainer">
			<div class="scrollContainerBorder">
				<div class="scrollContainer">
					<div class="scroll">
						1あああああ<br>1あああああ<br>1あああああ<br>
						<div class="core-btn test">test</div><br><br>
						2いいいいい<br>2いいいいい<br>2いいいいい<br>
						3ううううう<br>3ううううう<br>3ううううう<br>
						4えええええ<br>4えええええ<br>4えええええ<br>
						5おおおおお<br>5おおおおお<br>5おおおおお<br>
						6かかかかか<br>6かかかかか<br>6かかかかか<br>
						7ききききき<br>7ききききき<br>7ききききき<br>
						8くくくくく<br>8くくくくく<br>8くくくくく<br>
						9けけけけけ<br>9けけけけけ<br>9けけけけけ<br>
						0こここここ<br>0こここここ<br>0こここここ
					</div>
					<div class="ybar"></div>
				</div>
			</div>
		</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _data : variant;
	// 並べ替え要素
	var _pickerItemList : SECpopupPickerItem[];
	var _pickerSelected = -1;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this._data = response;

		// 並べ替え要素作成
		this._pickerItemList = [
			new SECpopupPickerItem("test1", "新着順"),
			new SECpopupPickerItem("test2", "Lv順"),
			new SECpopupPickerItem("test3", "atk順"),
			new SECpopupPickerItem("test4", "grd順"),
			new SECpopupPickerItem("test5", "luk順"),
		];
		this._pickerItemList[0].selected = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		if(this._page.bodyDiv.className.indexOf("list") < 0){
			// タブ変更時にDOM生成
			this._page.bodyDiv.innerHTML = this._htmlTag;
			this._page.bodyDiv.className = "body list";

			this._scroller = null;
		}

		// ピッカー設定
		var pickDiv = this._page.bodyDiv.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var pickLabelDiv = pickDiv.getElementsByClassName("label").item(0) as HTMLDivElement;
		var selected = -1;
		for(var i = 0; i < this._pickerItemList.length; i++){
			if(this._pickerItemList[i].selected){selected = i;}
		}
		if(this._pickerSelected != selected){
			// ピッカーの選択されている要素が変わった場合
			this._pickerSelected = selected;
			pickLabelDiv.innerHTML = this._pickerItemList[this._pickerSelected].name;
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["list"] = new PartsButton(this._page.tabListDiv, true);
		this._btnList["team"] = new PartsButton(this._page.tabTeamDiv, true);
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
				this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement,
				null,
				this._page.bodyDiv.getElementsByClassName("ybar").item(0) as HTMLDivElement
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		this._scroller.btnList["test"] = new PartsButton(this._scroller.scrollDiv.getElementsByClassName("core-btn").item(0) as HTMLDivElement, true);

		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// 並べ替えピッカーボタン
		if(this._btnList["pick"].trigger){this._page.serialPush(new SECpopupPicker(this._page, this, "並べ替え", this._pickerItemList)); return false;}

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

