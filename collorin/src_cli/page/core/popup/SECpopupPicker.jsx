import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

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
	var _pw = 200; // ウインドウ幅
	var _bh = 36; // 選択ボタン高さ

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, itemList : SECpopupPickerItem[]){
		super(cartridge);
		this._page = page;
		this._itemList = itemList;

		// スクローラ作成
		this._scroller = new PartsScroll(0, 0, this._pw - 6, 0, 0, 0);

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 0, 0, this._pw, 30);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, 0, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", 0, 0, 80, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// オープンボタン作成
	function createButton(x : int, y : int, w : int) : PartsButtonPickerOpener{
		this._openButton = new PartsButtonPickerOpener(x, y, w);
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			if(item.select){
				this._openButton.label.setText(item.name);
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

			if(item.select && this._openButton != null){this._openButton.label.setText(item.name);}

			var btn = this._scroller.btnList[item.tag];
			if(btn != null){btn.select = item.select;}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		this._page.header.setActive(false);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}

		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			var btn = new SECpopupPicker._PartsButtonPickerInner(item.name, 0, (this._bh + 2) * i, this._pw - 6, this._bh);
			btn.select = item.select;
			btn.inactive = item.inactive;
			btn.trigger = false;
			this._scroller.btnList[item.tag] = btn;
			if(item.select){this._center = i;}
		}

		// スクローラサイズ設定
		this._scroller.sh = (this._bh + 2) * this._itemList.length - 2;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 要素選択
		for(var i = 0; i < this._itemList.length; i++){
			var item = this._itemList[i];
			if(this._scroller.btnList[item.tag].trigger){
				Sound.playSE("ok");
				this.setSelectedItem(item.tag);
				this.onSelect(item.tag);
				this._page.serialPush(this.parentCartridge);
				return false;
			}
		}

		// 閉じるボタン押下処理
		if(this._btnList["outer"].trigger || this._btnList["close"].trigger){
			Sound.playSE("ng");
			this._page.serialPush(this.parentCartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var tLab = this._labList["title"];
		var oBtn = this._btnList["outer"];
		var cBtn = this._btnList["close"];
		var cArea = 42;
		var ph = oBtn.h = Math.min(Ctrl.screen.h - 20, this._scroller.sh + (3 + tLab.h + 2) + (3 + cArea + 2));
		var px = oBtn.x = Math.floor((Ctrl.screen.w - this._pw) * 0.5);
		var py = oBtn.y = Math.floor((Ctrl.screen.h - ph) * 0.5);
		tLab.x = px;
		tLab.y = py + 3;
		cBtn.x = px + (this._pw - cBtn.w) * 0.5;
		cBtn.y = py + ph - 3 - (cArea + cBtn.h) * 0.5;
		this._scroller.x = px + 3;
		this._scroller.y = py + (3 + tLab.h + 2);
		this._scroller.ch = ph - (3 + tLab.h + 2) - (3 + cArea + 2);

		// 最初の場合、選択されている要素をできるだけ中心に持ってくる
		if(this._center >= 0){
			var maxy = this._scroller.sh - this._scroller.ch;
			var centery = (this._scroller.ch - this._bh) * 0.5 - this._center * (this._bh + 2);
			this._scroller.scrolly = Math.min(Math.max(centery, -maxy), 0);
			this._center = -1;
		}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, this._pw, ph);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h), this._pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + ph - (3 + cArea) - 2, this._pw - 6, 2);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{
			Ctrl.sctx.fillStyle = "black";
			for(var i = 0; i < this._itemList.length - 1; i++){
				var x = 20 - 3;
				var y = (this._bh + 2) * i + this._bh;
				var w = this._pw - 20 * 2;
				if(this._scroller.isDrawClip(x, y, w, 2)){
					Ctrl.sctx.fillRect(x, y, w, 2);
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
		var label : PartsLabel;

		// ----------------------------------------------------------------
		// コンストラクタ
		function constructor(text : string, x : int, y : int, w : int, h : int){
			super(x, y, w, h, true);
			this.label = new PartsLabel(text, 0, 0, 0, 0);
			this.label.setSize(16);
		}

		// ----------------------------------------------------------------
		// 描画
		override function draw() : void{
			var isInactive = (this.inactive && !this.active && !this.select);
			// 箱描画
			Ctrl.sctx.fillStyle = isInactive ? "#cccccc" : this.active ? "#aaaaaa" : this.select ? "#ffffff" : "#cccccc";
			Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);
			// 文字列描画
			this.label.setColor(isInactive ? "gray" : "black");
			this.label.x = this.x;
			this.label.y = this.y;
			this.label.w = this.w;
			this.label.h = this.h;
			this.label.draw();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーオープンボタン
class PartsButtonPickerOpener extends PartsButton{
	var label : PartsLabel;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, w : int){
		super(x, y, w, 38, true);
		this.label = new PartsLabel("", 0, 0, 0, 0);
		this.label.setSize(16);
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
		this.label.setColor(isInactive ? "gray" : "black");
		this.label.x = this.x + 28;
		this.label.y = this.y + (this.active ? 2 : 0);
		this.label.w = this.w - 28;
		this.label.h = this.h - 2;
		this.label.draw();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

