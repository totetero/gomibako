import 'js/web.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 操作用クラス

class Ctrl{
	static var rootDiv : HTMLDivElement;
	static var ww : int;
	static var wh : int;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Ctrl.rootDiv = dom.document.getElementById("root") as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズの変更確認
		var ww = dom.window.innerWidth;
		var wh = dom.window.innerHeight;
		if(Ctrl.ww != ww || Ctrl.wh != wh){
			Ctrl.ww = ww;
			Ctrl.wh = wh;
			var dw = 320;
			var dh = Math.min(Math.max(wh, 320), 480);
			Ctrl.rootDiv.style.width = dw + "px";
			Ctrl.rootDiv.style.height = dh + "px";
			Ctrl.rootDiv.style.left = Math.floor((ww - dw) * 0.5) + "px";
			Ctrl.rootDiv.style.top = Math.floor((wh - dh) * 0.5) + "px";
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

