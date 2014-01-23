import "js/web.jsx";

import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./MyPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

abstract class Page extends EventPlayer{
	static var current : Page;

	// ページ機能の初期化
	static function init() : void{
		Page.current = new MyPage();
	}

	var div : HTMLDivElement;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class PageButton{
	var div : HTMLDivElement;
	var active : boolean;
	var trigger : boolean;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.div = div;
	}

	// 計算
	function calc() : void{
		if(Ctrl.mdn){
			var box = this.div.getBoundingClientRect();
			var x0 = box.left - Ctrl.sx;
			var y0 = box.top - Ctrl.sy;
			var x1 = x0 + box.width;
			var y1 = y0 + box.height;
			this.active = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
		}else if(this.active){
			this.active = false;
			this.trigger = true;
		}
	}

	// 描画
	function draw() : void{
		var isActive = this.div.className.indexOf(" active") >= 0;
		if(this.active && !isActive){
			this.div.className += " active";
		}else if(!this.active && isActive){
			this.div.className = this.div.className.replace(/ active/g , "");
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

