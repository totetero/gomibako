import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/PartsLabel.jsx";
import "../core/PartsButton.jsx";
import "../core/PartsScroll.jsx";
import "../core/SECpopupMenu.jsx";
import "../core/SECpopupPicker.jsx";
import "../core/SECpopupTextarea.jsx";

import "PageTest.jsx";
import "SECtestPopupTest.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストイベントカートリッジ
class SECtestMain implements SerialEventCartridge{
	var _page : PageTest;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _pickerPopup : SECpopupPicker;
	var _textareaPopup : SECpopupTextarea;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageTest){
		this._page = page;

		// ピッカー作成
		this._pickerPopup = new SECpopupPicker(this._page, this, "タイトル", [
			new SECpopupPickerItem("cat1", "にゃ1"),
			new SECpopupPickerItem("cat2", "にゃ2"),
			new SECpopupPickerItem("cat3", "にゃ3"),
			new SECpopupPickerItem("cat4", "にゃ4"),
			new SECpopupPickerItem("cat5", "にゃ5"),
			new SECpopupPickerItem("cat6", "にゃ6"),
			new SECpopupPickerItem("cat7", "にゃ7"),
			new SECpopupPickerItem("cat8", "にゃ8"),
			new SECpopupPickerItem("cat9", "にゃ9"),
		]);
		this._pickerPopup.setSelectedItem("cat3");
		this._pickerPopup.getItem("cat7").inactive = true;

		// テキストエリア作成
		this._textareaPopup = new SECpopupTextarea(this._page, this, "テスト入力", 5);
		this._textareaPopup.setValue("test");

		// スクローラ作成
		this._scroller = new PartsScroll(120, 60, 190, 0, 370, 360);

		// ラベル作成
		this._labList["test"] = new PartsLabel("test", 10, 60, 100, 30);
		this._labList["test"].setSize(24);

		// ボタン作成
		this._btnList["picker"] = this._pickerPopup.createButton(10, 100, 100);
		this._btnList["textarea"] = this._textareaPopup.createButton(10, 148, 100, 30);
		this._btnList["back"] = new PartsButtonBasic("戻る", 10, 440, 100, 30);
		this._btnList["back"].inactive = false;
		this._btnList["back"].sKey = true;

		for(var i = 0; i < 2; i++){
			for(var j = 0; j < 5; j++){
				var num = (i * 5 + j);
				var name = "test" + num;
				// スクロールラベル作成
				this._scroller.labList[name] = new PartsLabel("てす" + num, 10 + 180 * i, 10 + 40 * j, 60, 30);
				this._scroller.labList[name].setAlign("right");
				// スクロールボタン作成
				this._scroller.btnList[name] = new PartsButtonBasic("ボタン", 80 + 180 * i, 10 + 40 * j, 100, 30);
			}
		}
		this._scroller.btnList["test2"].select = true;
		this._scroller.btnList["test3"].select = true;
		this._scroller.btnList["test3"].inactive = true;
		this._scroller.btnList["test4"].inactive = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラとじてる
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// ヘッダ有効化
		this._page.header.setActive(true);

		var item = this._pickerPopup.getSelectedItem();
		log (item != null) ? item.tag : "";
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テストボタン押下処理
		var btn = this._scroller.btnList["test0"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(new SECtestPopupTest(this._page, this));
			return false;
		}

		// ピッカーボタン押下処理
		var btn = this._btnList["picker"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._pickerPopup);
			return false;
		}

		// テキストエリアボタン押下処理
		var btn = this._btnList["textarea"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(this._textareaPopup);
			return false;
		}

		// 戻るボタン押下処理
		var btn = this._btnList["back"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			this._page.header.lbtn.trigger = false;
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this._page.header.rbtn.trigger){
			this._page.header.rbtn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		var by = Math.max(188, Ctrl.sh - (200 + 10));
		var bh = Math.min(200, Ctrl.sh - (188 + 10)) - 40;
		this._btnList["back"].y = this._btnList["back"].basey + (Ctrl.sh - 480);
		this._scroller.ch = Ctrl.sh - 58 - 10;

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);

		// テストボックス描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], 10, by, 100, bh);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{
			if(this._scroller.isDrawClip(10, 210, 350, 140)){
				Ctrl.sctx.fillStyle = "white";
				Ctrl.sctx.fillRect(10, 210, 350, 140);
			}
		});
		Ctrl.sctx.lineWidth = 2;
		Ctrl.sctx.strokeStyle = "black";
		Ctrl.sctx.strokeRect(this._scroller.x, this._scroller.y, this._scroller.cw, this._scroller.ch);

		// ヘッダ描画
		this._page.header.draw();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

