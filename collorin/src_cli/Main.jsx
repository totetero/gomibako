import "timer.jsx";
import "js/web.jsx";

import "util/Ctrl.jsx";
import "util/Sound.jsx";
import "util/Drawer.jsx";
import "util/Loader.jsx";
import "util/Loading.jsx";
import "util/EventCartridge.jsx";
import "page/core/Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		// 初期化
		Ctrl.init("コロリン");
		Sound.init();
		Drawer.init();
		Loader.init();
		Loading.init();
		Page.init();

		// メインループ開始
		_Main.mainloop();
	}

	// メインループ
	static function mainloop() : void{
		// 計算
		Ctrl.calc();
		Page.calc();
		Loading.calc();

		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

