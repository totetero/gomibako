import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsLabel.jsx";
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
	var select : boolean;
	var inactive : boolean;
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(tag : string, name : string){
		this.tag = tag;
		this.name = name;
		this.select = false;
		this.inactive = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップ
class SECpopupPicker extends SECpopup{
	var _page : Page;
	var _itemList : SECpopupPickerItem[];
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;
	// ポップアップ展開用のボタン
	var _openButton : PartsButtonPickerOpener;

	var _center : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, itemList : SECpopupPickerItem[]){
		super(cartridge);
		this._page = page;
		this._itemList = itemList;

		// スクローラ作成
		this._scroller = new PartsScroll(63, 0, 194, 0, 60, 0);

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 60, 0, 200, 30);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(60, 0, 200, 0, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", 120, 0, 80, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// オープンボタン作成
	function createButton(x : int, y : int, w : int) : PartsButtonPickerOpener{
		this._openButton = new PartsButtonPickerOpener(x, y, w);
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			if(item.select){
				this._openButton.setText(item.name);
			}
		}
		return this._openButton;
	}

	// ----------------------------------------------------------------
	// 要素の獲得
	function getItem(tag : string) : SECpopupPickerItem{
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			if(item.tag == tag){
				return item;
			}
		}
		return null;
	}

	// ----------------------------------------------------------------
	// 選択されている要素の獲得
	function getSelectedItem() : SECpopupPickerItem{
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			if(item.select){
				return item;
			}
		}
		return null;
	}

	// ----------------------------------------------------------------
	// 要素の選択
	function setSelectedItem(tag : string) : void{
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			item.select = (item.tag == tag);

			if(item.select && this._openButton != null){this._openButton.setText(item.name);}

			var btn = this._scroller.btnList[item.tag];
			if(btn != null){btn.select = item.select;}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラとじてる
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// ヘッダ無効化
		this._page.header.setActive(false);

		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			var btn = new SECpopupPicker._PartsButtonPickerInner(item.name, 0, 38 * i, 194, 36);
			btn.select = item.select;
			btn.inactive = item.inactive;
			this._scroller.btnList[item.tag] = btn;
			if(item.select){this._center = i;}
		}

		// スクローラサイズ設定
		this._scroller.sh = 38 * this._itemList.length - 2;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 要素選択
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			var btn = this._scroller.btnList[item.tag];
			if(btn.trigger){
				btn.trigger = false;
				Sound.playSE("ok");
				this.setSelectedItem(item.tag);
				this.onSelect(item.tag);
				this._page.serialPush(this.parentCartridge);
				this.close = true;
				return false;
			}
		}

		// 閉じるボタン押下処理
		var btn0 = this._btnList["outer"];
		var btn1 = this._btnList["close"];
		if(btn0.trigger || btn1.trigger){
			btn0.trigger = false;
			btn1.trigger = false;
			Sound.playSE("ng");
			this._page.serialPush(this.parentCartridge);
			this.close = true;
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var ph = Math.min(Ctrl.sh - 20, this._scroller.sh + (3 + 30 + 2) + (3 + 42 + 2));
		var py = Math.floor((Ctrl.sh - ph) * 0.5);
		this._labList["title"].y = py + 3;
		this._btnList["close"].y = py + ph - 3 - (42 + 30) * 0.5;
		this._btnList["outer"].y = py;
		this._btnList["outer"].h = ph;
		this._scroller.y = py + (3 + 30 + 2);
		this._scroller.ch = ph - (3 + 30 + 2) - (3 + 42 + 2);

		// 最初の場合、選択されている要素をできるだけ中心に持ってくる
		if(this._center >= 0){
			var maxy = this._scroller.sh - this._scroller.ch;
			var centery = this._scroller.ch * 0.5 - 18 - this._center * 38;
			this._scroller.scrolly = Math.min(Math.max(centery, -maxy), 0);
			this._center = -1;
		}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], 60, py, 200, ph);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(63, py + (3 + 30), 194, 2);
		Ctrl.sctx.fillRect(63, py + ph - (3 + 42) - 2, 194, 2);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{
			Ctrl.sctx.fillStyle = "black";
			for(var i = 0; i < this._itemList.length - 1; i++){
				if(this._scroller.isDrawClip(17, 38 * i + 36, 160, 2)){
					Ctrl.sctx.fillRect(17, 38 * i + 36, 160, 2);
				}
			}
		});
	}

	// ----------------------------------------------------------------
	// 選択時の動作 継承用
	function onSelect(tag : string) : void{}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}

	// ----------------------------------------------------------------
	// ピッカー内部ボタン
	class _PartsButtonPickerInner extends PartsButton{
		var _textCvs : HTMLCanvasElement;
		var _text : string;
		var _status : string;

		// ----------------------------------------------------------------
		// コンストラクタ
		function constructor(text : string, x : int, y : int, w : int, h : int){
			super(x, y, w, h, true);
			this._text = text;
		}

		// ----------------------------------------------------------------
		// 描画
		override function draw() : void{
			var isInactive = (this.inactive && !this.active && !this.select);
			// 箱描画
			Ctrl.sctx.fillStyle = isInactive ? "#cccccc" : this.active ? "#aaaaaa" : this.select ? "#ffffff" : "#cccccc";
			Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);
			// 文字列描画
			var pixelRatio = 2;
			if(!isInactive && this._status != "normal"){this._status = "normal"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "black");}
			if(isInactive && this._status != "inactive"){this._status = "inactive"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "gray");}
			var w = this._textCvs.width / pixelRatio;
			var h = this._textCvs.height / pixelRatio;
			var x = this.x + (this.w - w) * 0.5;
			var y = this.y + (this.h - h) * 0.5;
			Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーオープンボタン
class PartsButtonPickerOpener extends PartsButton{
	var _textCvs : HTMLCanvasElement;
	var _text : string;
	var _status : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, w : int){
		super(x, y, w, 38, true);
	}

	// ----------------------------------------------------------------
	// 文字列設定
	function setText(text : string) : void{
		this._text = text;
		this._status = "";
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var isInactive = (this.inactive && !this.active && !this.select);
		// 箱描画
		var type = isInactive ? "inactive" : this.active ? "active" : this.select ? "select" : "normal";
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_button_basic_" + type], this.x + 28, this.y + 4, this.w - 28, 30);
		Ctrl.sctx.drawImage(Loader.imgs["img_system_button_picker_" + type], this.x, this.y, 38, 38);
		// 文字列描画
		var pixelRatio = 2;
		if(!isInactive && this._status != "normal"){this._status = "normal"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "black");}
		if(isInactive && this._status != "inactive"){this._status = "inactive"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "gray");}
		var w = this._textCvs.width / pixelRatio;
		var h = this._textCvs.height / pixelRatio;
		var x = this.x + 14 + (this.w - w) * 0.5;
		var y = this.y + (this.h - h - 2) * 0.5 + (this.active ? 2 : 0);
		Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

