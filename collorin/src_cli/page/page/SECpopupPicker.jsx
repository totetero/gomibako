import "js/web.jsx";

import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "PartsScroll.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップの要素クラス
class SECpopupPickerItem{
	var tag : string;
	var name : string;
	var selected : boolean;
	var inactive : boolean;
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(tag : string, name : string){
		this.tag = tag;
		this.name = name;
		this.selected = false;
		this.inactive = false;
	}
}

// ピッカーポップアップ
class SECpopupPicker extends SECpopup{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="title"></div>
			<div class="scrollContainer">
				<div class="scroll"></div>
				<div class="ybar"></div>
			</div>
			<div class="buttonContainer">
				<div class="core-btn close">閉じる</div>
			</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _title : string;
	var _itemList : SECpopupPickerItem[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge, title : string, itemList : SECpopupPickerItem[]){
		this._page = page;
		this._cartridge = cartridge;
		this._title = title;
		this._itemList = itemList;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core picker";
		this.popupDiv.innerHTML = this._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this.windowDiv.getElementsByClassName("title").item(0) as HTMLDivElement).innerHTML = this._title;
		var scrollContainerDiv = this.windowDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement;
		var scrollDiv = this.windowDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// 要素作成
		var scrollTag = "";
		var selectedIndex = -1;
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			var className = "item";
			if(item.selected && selectedIndex < 0){
				className += " select";
				selectedIndex = i;
			}
			scrollTag += "<div class='" + className + "'>" + item.name + "</div><div class='border'></div>";
		}
		scrollDiv.innerHTML = scrollTag;
		
		// ウインドウサイズ調整
		var pickerSize = Math.min(144, 38 * this._itemList.length - 2);
		var windowSize = 220 - 144 + pickerSize;
		this.windowDiv.style.height = windowSize + "px";
		this.windowDiv.style.marginTop = ((windowSize + 6) * -0.5) + "px";
		scrollContainerDiv.style.height = pickerSize + "px";

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);

		// スクロール作成
		this._scroller = new PartsScroll(
			scrollContainerDiv, scrollDiv, null,
			this.windowDiv.getElementsByClassName("ybar").item(0) as HTMLDivElement
		);
		// 選択されている要素をできるだけ中心に持ってくる
		this._scroller.scrolly = pickerSize * 0.5 - 18 - selectedIndex * 38;;
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._itemList.length; i++){
			var btn = new PartsButton(scrollDiv.getElementsByClassName("item").item(i) as HTMLDivElement, true);
			this._scroller.btnList[this._itemList[i].tag] = btn;
			btn.inactive = this._itemList[i].inactive;
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// 要素選択
		for(var i = 0; i < this._itemList.length; i++){
			var btn = this._scroller.btnList[this._itemList[i].tag];
			if(btn.trigger){
				btn.trigger = false;
				if(active){
					// 選択フラグ設定
					for(var j = 0; j < this._itemList.length; j++){
						this._scroller.btnList[this._itemList[j].tag].div.className = (i == j) ? "item select" : "item";
						this._itemList[j].selected = (i == j);
					}
					// 選択完了
					this._page.serialPush(this._cartridge);
					return false;
				}
			}
		}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				this._page.serialPush(this._cartridge);
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

