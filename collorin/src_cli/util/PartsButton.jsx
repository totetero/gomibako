import "Ctrl.jsx";
import "Drawer.jsx";
import "Loader.jsx";
import "PartsLabel.jsx";

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
	var target : boolean;
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
	var _stdn : boolean;

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
		var target = false;
		if(this._stdn != Ctrl.stdn){target = this._stdn = Ctrl.stdn;}

		if(this.inactive || !clickable){
			// ボタン無効状態
			this.active = false;
		}else if((this.zKey && Ctrl.k_z) || (this.xKey && Ctrl.k_x) || (this.cKey && Ctrl.k_c) || (this.sKey && Ctrl.k_s)){
			// 対応キー押下中
			this.active = true;
		}else if(Ctrl.stdn && (this.target || target)){
			// ボタン押下中
			var x0 = this.x;
			var y0 = this.y;
			var x1 = x0 + this.w;
			var y1 = y0 + this.h;
			var inner = (x0 < Ctrl.stx && Ctrl.stx < x1 && y0 < Ctrl.sty && Ctrl.sty < y1);
			this.active = (inner == this._inner);
			// 子要素の範囲内では押下状態にならない
			if(this.children != null){
				for(var i = 0; i < this.children.length; i++){
					var x0 = this.children[i].x;
					var y0 = this.children[i].y;
					var x1 = x0 + this.children[i].w;
					var y1 = y0 + this.children[i].h;
					this.active = this.active && !(x0 < Ctrl.stx && Ctrl.stx < x1 && y0 < Ctrl.sty && Ctrl.sty < y1);
				}
			}
			// ボタン押下の瞬間に押下確定フラグ
			if(target){this.target = this.active;}
		}else if(this.active){
			// ボタンを放した瞬間
			this.active = false;
			this.trigger = true;
			this.target = false;
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{}
}

// ページ用ボタンクラス
class PartsButtonBasic extends PartsButton{
	var label : PartsLabel;
	var buttonType = "basic";

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
		var imgCode = "img_system_button_" + this.buttonType + "_" + (isInactive ? "inactive" : this.active ? "active" : this.select ? "select" : "normal");
		Drawer.drawBox(Ctrl.sctx, Loader.imgs[imgCode], this.x, this.y, this.w, this.h);
		// 文字列描画
		this.label.setColor(isInactive ? "gray" : "black");
		this.label.x = this.x;
		this.label.y = this.y + (this.active ? 2 : 0);
		this.label.w = this.w ;
		this.label.h = this.h - 2;
		this.label.draw();
	}
}

// 左タブクラス
class PartsButtonTabLeft extends PartsButtonBasic{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(text : string, x : int, y : int, w : int, h : int){
		super(text, x, y, w, h);
		this.buttonType = "tabLeft";
		this.label.setSize(14);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

