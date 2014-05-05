import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";

import "Page.jsx";
import "PartsButton.jsx";
import "PartsScroll.jsx";
import "PartsCharacter.jsx";
import "SECpopup.jsx";
import "SECpopupPicker.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップ
abstract class SECpopupPickerCharacter extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="title"></div>
			<div class="pickerContainer"><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow cssimg_core_picker_arrow"></div></div></div>
			<div class="scrollContainer">
				<div class="scroll"></div>
				<div class="core-ybar"></div>
			</div>
			<div class="buttonContainer">
				<div class="core-btn remove">外す</div>
				<div class="core-btn close">閉じる</div>
			</div>
		</div>
	""";

	var _page : Page;
	var _cartridge : EventCartridge;
	var _title : string;
	var _isRemovable : boolean;
	var _charaList : PartsCharaListItem[];
	var _sortPicker : SECpopupPicker;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _prevscrolly : int;
	var _prevtag = "";
	var _prevsh = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : EventCartridge, title : string, isRemovable : boolean, charaList : PartsCharaListItem[], sortPicker : SECpopupPicker, scrolly : int){
		this._page = page;
		this._cartridge = cartridge;
		this._title = title;
		this._isRemovable = isRemovable;
		this._charaList = charaList;
		this._sortPicker = sortPicker;
		this._prevscrolly = scrolly;
	}

	// ----------------------------------------------------------------
	// ウインドウサイズ確認と調整
	function _checkWindowSize(force : boolean) : void{
		if(force || this._prevsh != Ctrl.sh){
			this._prevsh = Ctrl.sh;
			var itemSize = 32 + 44 + ((this._sortPicker != null) ? 50 : 0);
			var maxPickerSize = Ctrl.sh - itemSize - 20;
			var pickerSize = Math.min(maxPickerSize, 60 * this._charaList.length);
			var windowSize = itemSize + pickerSize;
			this.windowDiv.style.height = windowSize + "px";
			this.windowDiv.style.marginTop = ((windowSize + 6) * -0.5) + "px";
			(this.windowDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement).style.height = pickerSize + "px";
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core characterPicker";
		this.popupDiv.innerHTML = SECpopupPickerCharacter._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this.windowDiv.getElementsByClassName("title").item(0) as HTMLDivElement).innerHTML = this._title;
		var pickDiv = this.windowDiv.getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var scrollDiv = this.windowDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// ウインドウサイズ調整
		this._checkWindowSize(true);

		if(this._sortPicker != null){
			// ピッカー設定
			var selectedItem = this._sortPicker.getSelectedItem();
			(pickDiv.getElementsByClassName("core-picker-label").item(0) as HTMLDivElement).innerHTML = selectedItem.name;
			if(this._prevtag != selectedItem.tag){
				this._prevtag = selectedItem.tag;
				PartsCharaListItem.sort(this._charaList, selectedItem.tag);
				// ソート時スクロールリセット ただし最初はのぞく
				if(this._scroller != null){this._prevscrolly = 0;}
			}
		}else{
			(this.windowDiv.getElementsByClassName("pickerContainer").item(0) as HTMLDivElement).style.display = "none";
		}
		// キャラクターリスト作成
		scrollDiv.style.height = (this._charaList.length * 60) + "px";
		scrollDiv.innerHTML = "";
		for(var i = 0; i < this._charaList.length; i++){
			this._charaList[i].bodyDiv.style.top = (60 * i) + "px";
			scrollDiv.appendChild(this._charaList[i].bodyDiv);
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["pick"] = new PartsButton(pickDiv, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["close"].sKey = true;
		// 外すボタン
		if(this._isRemovable){this._btnList["remove"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn remove").item(0) as HTMLDivElement, true);}
		(this.windowDiv.getElementsByClassName("buttonContainer").item(0) as HTMLDivElement).className = "buttonContainer" + (this._isRemovable ? " removable" : "");

		// スクロール作成
		this._scroller = new PartsScroll(
			this.windowDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
			scrollDiv,
			null,
			this.windowDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
		);
		this._scroller.scrolly = this._prevscrolly;
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._charaList.length; i++){
			var itemBtn = new PartsButton(this._charaList[i].bodyDiv, true);
			var iconBtn = new PartsButton(this._charaList[i].iconDiv, true);
			this._scroller.btnList["charaItem" + i] = itemBtn;
			this._scroller.btnList["charaIcon" + i] = iconBtn;
			itemBtn.children = [iconBtn.div];
			if(this._charaList[i].select){this._scroller.btnList["charaItem" + i].inactive = true;}
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// ウインドウサイズ確認
		this._checkWindowSize(false);
		var pickerSize = Number.parseInt(this._scroller.containerDiv.style.height, 10);

		// キャラクターリストボタン
		for(var i = 0; i < this._charaList.length; i++){
			var item = this._charaList[i];

			// 要素ボタン
			var btn = this._scroller.btnList["charaItem" + i];
			if(btn.trigger){
				btn.trigger = false;
				if(active){
					Sound.playSE("ok");
					// 選択完了
					this.onSelect(item);
					this.onClose(this._scroller.scrolly);
					this._page.serialPush(this._cartridge);
					return false;
				}
			}

			// アイコンボタン
			var btn = this._scroller.btnList["charaIcon" + i];
			if(btn.trigger){
				btn.trigger = false;
				if(active){
					Sound.playSE("ok");
					this._page.serialPush(new SECpopupInfoChara(this._page, this, item));
					this._prevscrolly = this._scroller.scrolly;
					return false;
				}
			}

			// 軽量化のために見えない要素は非表示
			var position = i * 60 + this._scroller.scrolly;
			var display = (-60 < position && position < pickerSize) ? "block" : "none";
			if(item.bodyDiv.style.display != display){
				item.bodyDiv.style.display = display;
			}
		}

		if(this._sortPicker != null){
			// 並べ替えピッカーボタン
			if(this._btnList["pick"].trigger){
				this._btnList["pick"].trigger = false;
				if(active){
					Sound.playSE("ok");
					this._page.serialPush(this._sortPicker.beforeOpen(this._page, this));
					this._prevscrolly = this._scroller.scrolly;
					return false;
				}
			}
		}

		// 外すボタン
		if(this._isRemovable && this._btnList["remove"].trigger){
			this._btnList["remove"].trigger = false;
			if(active){
				Sound.playSE("ok");
				// 選択完了
				this.onSelect(null);
				this.onClose(this._scroller.scrolly);
				this._page.serialPush(this._cartridge);
				return false;
			}
		}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				Sound.playSE("ng");
				this.onClose(this._scroller.scrolly);
				this._page.serialPush(this._cartridge);
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 選択時の動作 継承用
	abstract function onSelect(chara : PartsCharaListItem) : void;

	// ----------------------------------------------------------------
	// 閉じるときの動作 継承用
	function onClose(scrolly : int) : void{}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

