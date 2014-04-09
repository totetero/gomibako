import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "PartsScroll.jsx";
import "PartsCharacter.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップ
class SECpopupCharacterPicker extends SECpopup{
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
	var _charaList : PartsCharaListItem[];
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(title : string, charaList : PartsCharaListItem[]){
		this._title = title;
		this._charaList = charaList;

		// てすと
		var list = [
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
			{"name":"test00","code":"player1"},
		];
		this._charaList = new PartsCharaListItem[];
		for(var i = 0; i < list.length; i++){
			this._charaList.push(new PartsCharaListItem(list[i]));
		}
	}

	// ----------------------------------------------------------------
	// 開く前の設定
	function beforeOpen(page : Page, cartridge : EventCartridge) : SECpopupCharacterPicker{
		this._page = page;
		this._cartridge = cartridge;
		return this;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core characterPicker";
		this.popupDiv.innerHTML = SECpopupCharacterPicker._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this.windowDiv.getElementsByClassName("title").item(0) as HTMLDivElement).innerHTML = this._title;
		var scrollContainerDiv = this.windowDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement;
		var scrollDiv = this.windowDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// ピッカーの選択されている要素が変わった場合
//		PartsCharaListItem.sort(this._charaList, tag);
		// キャラクターリスト作成
		scrollDiv.innerHTML = "";
		for(var i = 0; i < this._charaList.length; i++){
			scrollDiv.appendChild(this._charaList[i].bodyDiv);
		}

		// ウインドウサイズ調整
		var maxPickerSize = Ctrl.sh - 240 + 144;
		var pickerSize = Math.min(maxPickerSize, 60 * this._charaList.length);
		var windowSize = 220 - 144 + pickerSize;
		this.windowDiv.style.height = windowSize + "px";
		this.windowDiv.style.marginTop = ((windowSize + 6) * -0.5) + "px";
		scrollContainerDiv.style.height = pickerSize + "px";

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["close"].sKey = true;

		// スクロール作成
		this._scroller = new PartsScroll(
			scrollContainerDiv, scrollDiv, null,
			this.windowDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
		);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				Sound.playSE("ng");
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

