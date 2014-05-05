import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ボタンクラス
class PartsButton{
	var basex : int;
	var basey : int;
	var x : int;
	var y : int;
	var w : int;
	var h : int;
	var active : boolean;
	var select : boolean;
	var inactive : boolean;
	var trigger : boolean;
	var children : PartsButton[];
	var zKey = false;
	var xKey = false;
	var cKey = false;
	var sKey = false;
	var _inner : boolean;
	var _ctdn : boolean;
	var _press : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, w : int, h : int, inner : boolean){
		this.basex = x;
		this.basey = y;
		this.x = this.basex;
		this.y = this.basey;
		this.w = w;
		this.h = h;
		this._inner = inner;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		// ボタン押下の瞬間を確認
		var press = false;
		if(this._ctdn != Ctrl.ctdn){press = this._ctdn = Ctrl.ctdn;}

		if(this.inactive || !clickable){
			// ボタン無効状態
			this.active = false;
		}else if((this.zKey && Ctrl.k_z) || (this.xKey && Ctrl.k_x) || (this.cKey && Ctrl.k_c) || (this.sKey && Ctrl.k_s)){
			// 対応キー押下中
			this.active = true;
		}else if(Ctrl.ctdn && (this._press || press)){
			// ボタン押下中
			var x0 = this.x;
			var y0 = this.y;
			var x1 = x0 + this.w;
			var y1 = y0 + this.h;
			var inner = (x0 < Ctrl.ctx && Ctrl.ctx < x1 && y0 < Ctrl.cty && Ctrl.cty < y1);
			this.active = (inner == this._inner);
			// 子要素の範囲内では押下状態にならない
			if(this.children != null){
				for(var i = 0; i < this.children.length; i++){
					var x0 = this.children[i].x;
					var y0 = this.children[i].y;
					var x1 = x0 + this.children[i].w;
					var y1 = y0 + this.children[i].h;
					this.active = this.active && !(x0 < Ctrl.ctx && Ctrl.ctx < x1 && y0 < Ctrl.cty && Ctrl.cty < y1);
				}
			}
			// ボタン押下の瞬間に押下確定フラグ
			if(press){this._press = this.active;}
		}else if(this.active){
			// ボタンを放した瞬間
			this.active = false;
			this.trigger = true;
			this._press = false;
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{}
}

// ページ用ボタンクラス
class PartsButtonBasic extends PartsButton{
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
		var imgCode = "img_system_button_basic_" + (isInactive ? "inactive" : this.active ? "active" : this.select ? "select" : "normal");
		Drawer.drawBox(Ctrl.sctx, Loader.imgs[imgCode], this.x, this.y, this.w, this.h);
		// 文字列描画
		var pixelRatio = 2;
		if(!isInactive && this._status != "normal"){this._status = "normal"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "black");}
		if(isInactive && this._status != "inactive"){this._status = "inactive"; this._textCvs = Drawer.createText(this._text, 16 * pixelRatio, "gray");}
		var w = this._textCvs.width / pixelRatio;
		var h = this._textCvs.height / pixelRatio;
		var x = this.x + (this.w - w) * 0.5;
		var y = this.y + (this.h - h - 2) * 0.5 + (this.active ? 2 : 0);
		Ctrl.sctx.drawImage(this._textCvs, x, y, w, h);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

