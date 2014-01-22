import "timer.jsx";
import "js/web.jsx";

import "./util/Ctrl.jsx";
import "./page/Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		Ctrl.init();
		Page.init();

		_Main.mainloop();
	}

	// メインループ
	static function mainloop() : void{
		var page = Page.current;

		// イベント処理
		Ctrl.calc();
		page.calcSerialEvent();
		page.calcParallelEvent();
		Ctrl.draw();
		page.drawSerialEvent();
		page.drawParallelEvent();

		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

