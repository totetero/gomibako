import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ラベルクラス
class PartsLabel{
	var basex : int;
	var basey : int;
	var x : int;
	var y : int;
	var w : int;
	var h : int;

	var _textCvs : HTMLCanvasElement;
	var _text : string;
	var _size = 16;
	var _color = "black";
	var _align = "center";

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(text : string, x : int, y : int, w : int, h : int){
		this.basex = x;
		this.basey = y;
		this.x = this.basex;
		this.y = this.basey;
		this.w = w;
		this.h = h;

		this._text = text;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		var pixelRatio = 2;
		if(this._textCvs == null){this._textCvs = Drawer.createText(this._text, this._size * pixelRatio, this._color, this.w * pixelRatio);}
		// 文字列描画
		var w = this._textCvs.width / pixelRatio;
		var h = this._textCvs.height / pixelRatio;
		var x = this.x + (this.w - w) * 0.5;
		var y = this.y + (this.h - h) * 0.5;
		if(this._align == "left"){x = this.x;}
		if(this._align == "right"){x = this.x + this.w - w;}
		//Ctrl.sctx.fillStyle = "rgba(0,0,0,0.3)";
		//Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);
		//Ctrl.sctx.fillRect(x, y, w, h);
		Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
	}

	// ----------------------------------------------------------------
	// 文字列変更
	function setTest(text : string) : void{
		this._text = text;
		this._textCvs = null;
	}

	// ----------------------------------------------------------------
	// サイズ設定
	function setSize(size : int) : void{
		this._size = size;
		this._textCvs = null;
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		this._color = color;
		this._textCvs = null;
	}

	// ----------------------------------------------------------------
	// 配置設定
	function setAlign(align : string) : void{
		this._align = align;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

