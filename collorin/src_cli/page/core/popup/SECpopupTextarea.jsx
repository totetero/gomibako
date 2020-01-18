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

// テキストエリアポップアップ
class SECpopupTextarea extends SECpopup{
	var page : Page;
	var _value : string;
	var _max : int;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	// ポップアップ展開用のボタン
	var _openButton : PartsButtonTextareaOpener;

	// 文字数0での決定を許可する
	var isPermitZero = true;

	var _ww : int;
	var _wh : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, max : int){
		super(cartridge);
		this.page = page;
		this._max = max;

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 0, 10, 300, 30);
		this._labList["count"] = new PartsLabel("", 10, 75, 40, 15);
		this._labList["count"].setSize(12);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 10, 300, 110, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", 190, 80, 100, 30);
		this._btnList["close"].sKey = true;
		this._btnList["ok"] = new PartsButtonBasic("決定", 80, 80, 100, 30);
	}

	// ----------------------------------------------------------------
	// オープンボタン作成
	function createButton(x : int, y : int, w : int, h : int) : PartsButtonTextareaOpener{
		this._openButton = new PartsButtonTextareaOpener(x, y, w, h);
		this._openButton.label.setText(this._value);
		return this._openButton;
	}

	// ----------------------------------------------------------------
	// 入力内容獲得
	function getValue() : string{
		return this._value;
	}

	// ----------------------------------------------------------------
	// 入力内容設定
	function setValue(value : string) : void{
		this._value = value;
		if(this._openButton != null){this._openButton.label.setText(this._value);}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this.page.ctrler.setLctrl(false);
		this.page.ctrler.setRctrl("", "", "", "");
		this.page.header.setActive(false);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}

		// テキストエリア設定
		Ctrl.input.type = "text";
		Ctrl.input.value = this._value;
		Ctrl.input.maxLength = this._max;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テキストエリア表示
		if(Ctrl.input.className != "textarea"){
			Ctrl.input.className = "textarea";
		}

		// 文字数確認
		var length = Ctrl.input.value.length;
		this._labList["count"].setText(length + "/" + this._max);
		this._labList["count"].setColor(length > this._max ? "red" : "black");
		// 文字数0確認
		this._btnList["ok"].inactive = (!this.isPermitZero && length <= 0);

		// ボタン押下時
		var ok = Ctrl.trigger_enter || this._btnList["ok"].trigger;
		var ng = this._btnList["outer"].trigger || this._btnList["close"].trigger;
		if(ok || ng){
			if(ok){
				Sound.playSE("ok");
				this.setValue(Ctrl.input.value);
				this.onEnter(this._value);
			}else{
				Sound.playSE("ng");
			}
			Ctrl.trigger_enter = false;
			Ctrl.input.className = "";
			this.page.serialPush(this.parentCartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var px = (Ctrl.screen.w - 300) * 0.5;
		if(this._ww != Ctrl.window.w || this._wh != Ctrl.window.h){
			this._ww = Ctrl.window.w;
			this._wh = Ctrl.window.h;
			Ctrl.input.style.left = (Ctrl.screen.x + px + 10) + "px";
			Ctrl.input.style.top = (Ctrl.screen.y + 40) + "px";
			Ctrl.input.style.width = "280px";
			Ctrl.input.style.height = "30px";
		}
		for(var name in this._labList){var lab = this._labList[name]; lab.x = px + lab.basex;}
		for(var name in this._btnList){var btn = this._btnList[name]; btn.x = px + btn.basex;}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, 10, 300, 110);
		Ctrl.sctx.fillStyle = "#ffffff";
		Ctrl.sctx.fillRect(px + 10, 40, 280, 30);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作 継承用
	function onEnter(value : string) : void{}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		Ctrl.input.blur();
		Ctrl.input.className = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テキストエリアオープンボタン
class PartsButtonTextareaOpener extends PartsButton{
	var label : PartsLabel;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, w : int, h : int){
		super(x, y, w, h, true);
		this.label = new PartsLabel("", 0, 0, 0, 0);
		this.label.setSize(16);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var isInactive = (this.inactive && !this.active && !this.select);
		// 箱描画
		Ctrl.sctx.fillStyle = isInactive ? "gray" : "black";
		Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);
		Ctrl.sctx.fillStyle = isInactive ? "#cccccc" : this.active ? "#aaaaaa" : "#ffffff";
		Ctrl.sctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
		// 文字列描画
		this.label.setColor(isInactive ? "gray" : "black");
		this.label.x = this.x + 5;
		this.label.y = this.y;
		this.label.w = this.w - 10;
		this.label.h = this.h;
		this.label.draw();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

