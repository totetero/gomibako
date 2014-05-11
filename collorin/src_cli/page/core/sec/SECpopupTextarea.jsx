import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

import "../Page.jsx";
import "../parts/PartsLabel.jsx";
import "../parts/PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テキストエリアポップアップ
class SECpopupTextarea extends SECpopup{
	var page : Page;
	var _value : string;
	var _max : int;
	var _input : HTMLInputElement;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	// ポップアップ展開用のボタン
	var _openButton : PartsButtonTextareaOpener;

	// 文字数0での決定を許可する
	var isPermitZero = true;

	var _wh : int;
	var _textCvs : HTMLCanvasElement;
	var _textLength : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, max : int){
		super(cartridge);
		this.page = page;
		this._max = max;
		this._input = dom.document.getElementById("ctrl").getElementsByTagName("input").item(0) as HTMLInputElement;

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 10, 10, 300, 30);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(10, 10, 300, 110, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", 200, 80, 100, 30);
		this._btnList["close"].sKey = true;
		this._btnList["ok"] = new PartsButtonBasic("決定", 90, 80, 100, 30);
	}

	// ----------------------------------------------------------------
	// オープンボタン作成
	function createButton(x : int, y : int, w : int, h : int) : PartsButtonTextareaOpener{
		this._openButton = new PartsButtonTextareaOpener(x, y, w, h);
		this._openButton.setText(this._value);
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
		if(this._openButton != null){this._openButton.setText(this._value);}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラとじてる
		this.page.ctrler.setLctrl(false);
		this.page.ctrler.setRctrl("", "", "", "");
		// ヘッダ無効化
		this.page.header.setActive(false);

		// テキストエリア設定
		this._input.type = "text";
		this._input.value = this._value;
		this._input.maxLength = this._max;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テキストエリア表示
		if(this._input.className != "textarea"){
			this._input.className = "textarea";
		}

		// 文字数0確認
		this._btnList["ok"].inactive = (!this.isPermitZero && this._input.value.length <= 0);

		// ボタン押下時
		if(this._btnList["ok"].trigger || this._btnList["outer"].trigger || this._btnList["close"].trigger){
			var ok = this._btnList["ok"].trigger;
			this._btnList["ok"].trigger = false;
			this._btnList["outer"].trigger = false;
			this._btnList["close"].trigger = false;
			Sound.playSE(ok ? "ok" : "ng");
			if(ok){
				this.setValue(this._input.value);
				this.onEnter(this._value);
			}
			this._input.className = "";
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
		if(this._wh != Ctrl.wh){this._wh = Ctrl.wh; this._input.style.top = (Ctrl.sy + 40) + "px";}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], 10, 10, 300, 110);
		Ctrl.sctx.fillStyle = "#ffffff";
		Ctrl.sctx.fillRect(20, 40, 280, 30);

		// 文字数描画
		var pixelRatio = 2;
		if(this._textCvs == null || this._textLength != this._input.value.length){
			this._textLength = this._input.value.length;
			var text = this._textLength + "/" + this._max;
			this._textCvs = Drawer.createText(text, 12 * pixelRatio, "black");
		}
		var w = this._textCvs.width / pixelRatio;
		var h = this._textCvs.height / pixelRatio;
		var x = 20 + (40 - w) * 0.5;
		var y = 75 + (15 - h) * 0.5;
		Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
		//Ctrl.sctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		//Ctrl.sctx.fillRect(20, 75, 40, 15);

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
		this._input.blur();
		this._input.className = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テキストエリアオープンボタン
class PartsButtonTextareaOpener extends PartsButton{
	var _textCvs : HTMLCanvasElement;
	var _text : string;
	var _status : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, w : int, h : int){
		super(x, y, w, h, true);
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
		Ctrl.sctx.fillStyle = isInactive ? "gray" : "black";
		Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);
		Ctrl.sctx.fillStyle = isInactive ? "#cccccc" : this.active ? "#aaaaaa" : "#ffffff";
		Ctrl.sctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
		// 文字列描画
		var pixelRatio = 2;
		var maxWidth = (this.w - 10) * pixelRatio;
		if(!isInactive && this._status != "normal"){this._status = "normal"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "black", maxWidth);}
		if(isInactive && this._status != "inactive"){this._status = "inactive"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "gray", maxWidth);}
		var w = this._textCvs.width / pixelRatio;
		var h = this._textCvs.height / pixelRatio;
		var x = this.x + (this.w - w) * 0.5;
		var y = this.y + (this.h - h) * 0.5;
		Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

