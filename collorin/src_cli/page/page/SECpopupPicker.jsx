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
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="title"></div>
			<div class="scrollContainer">
				<div class="scroll"></div>
				<div class="core-ybar"></div>
			</div>
			<div class="buttonContainer">
				<div class="core-btn close">閉じる</div>
			</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _title : string;
	var _itemList : SECpopupPickerItem[];
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _selected = -1;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(title : string, itemList : SECpopupPickerItem[], selected : int){
		this._title = title;
		this._itemList = itemList;
		this._itemList[selected].selected = true;
	}

	// ----------------------------------------------------------------
	// ピッカーボタンのラベル設定 選択要素が変わっていた場合はそのタグも返す
	function setLabel(div : HTMLDivElement) : string{
		var selected = -1;
		for(var i = 0; i < this._itemList.length; i++){if(this._itemList[i].selected){selected = i; break;}}
		if(this._selected != selected){
			this._selected = selected;
			var label = (selected < 0) ? "" : this._itemList[selected].name;
			(div.getElementsByClassName("core-picker-label").item(0) as HTMLDivElement).innerHTML = label;
			return this._itemList[selected].tag;
		}
		return "";	}

	// ----------------------------------------------------------------
	// 開く前の設定
	function beforeOpen(page : Page, cartridge : EventCartridge) : SECpopupPicker{
		this._page = page;
		this._cartridge = cartridge;
		return this;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core picker";
		this.popupDiv.innerHTML = SECpopupPicker._htmlTag;
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
			this.windowDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
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
					this.beforeClose(i);
					return false;
				}
			}
		}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				this.beforeClose(-1);
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 閉じる直前の動作
	function beforeClose(index : int) : void{
		this._page.serialPush(this._cartridge);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

