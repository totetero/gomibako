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
		Ctrl.calc();

		// イベント処理
		var page = Page.current;
		page.calcSerialEvent();
		page.calcParallelEvent();
		page.drawSerialEvent();
		page.drawParallelEvent();

		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

