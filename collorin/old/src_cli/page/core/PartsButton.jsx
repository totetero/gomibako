import "js/web.jsx";

import "../../util/Ctrl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用ボタンクラス
class PartsButton{
	var div : HTMLDivElement;
	var children : HTMLDivElement[];
	var active : boolean;
	var inactive : boolean;
	var zKey = false;
	var xKey = false;
	var cKey = false;
	var sKey = false;
	var trigger : boolean;
	var _inner : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(div : HTMLDivElement, inner : boolean){
		this.div = div;
		this._inner = inner;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		if(this.inactive || !clickable){
			// ボタン無効状態
			this.active = false;
		}else if((this.zKey && Ctrl.k_z) || (this.xKey && Ctrl.k_x) || (this.cKey && Ctrl.k_c) || (this.sKey && Ctrl.k_s)){
			// 対応キー押下中
			this.active = true;
		}else if(Ctrl.mdn){
			// ボタン押下中
			var box = this.div.getBoundingClientRect();
			var x0 = box.left - Ctrl.sx;
			var y0 = box.top - Ctrl.sy;
			var x1 = x0 + box.width;
			var y1 = y0 + box.height;
			var inner = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
			this.active = (inner == this._inner);
			// 子要素の範囲内では押下状態にならない
			if(this.children != null){
				for(var i = 0; i < this.children.length; i++){
					var box = this.children[i].getBoundingClientRect();
					var x0 = box.left - Ctrl.sx;
					var y0 = box.top - Ctrl.sy;
					var x1 = x0 + box.width;
					var y1 = y0 + box.height;
					this.active = this.active && !(x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
				}
			}
		}else if(this.active){
			// ボタンを放した瞬間
			this.active = false;
			this.trigger = true;
		}

		// 押下描画
		var isActive = this.div.className.indexOf(" active") >= 0;
		if(this.active && !isActive){this.div.className += " active";}
		else if(!this.active && isActive){this.div.className = this.div.className.replace(/ active/g , "");}
		// 無効化描画
		var isInactive = this.div.className.indexOf(" inactive") >= 0;
		if(this.inactive && !isInactive){this.div.className += " inactive";}
		else if(!this.inactive && isInactive){this.div.className = this.div.className.replace(/ inactive/g , "");}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

