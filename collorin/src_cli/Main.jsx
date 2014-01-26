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
		// HTMLタグ設定
		dom.document.title = "コロリン";
		dom.document.body.innerHTML = """
			<div id="root">
				<div id="screen">
					<div class="page"></div>
					<div class="header">
						<div class="title"></div>
						<div class="btn back"></div>
						<div class="btn menu"></div>
					</div>
				</div>
				<div id="lctrl" class="ctrlBtn left">
					<div class="up"></div>
					<div class="dn"></div>
					<div class="rt"></div>
					<div class="lt"></div>
				</div>
				<div id="rctrl" class="ctrlBtn right">
					<div class="zb"></div>
					<div class="xb"></div>
					<div class="cb"></div>
					<div class="sb"></div>
				</div>
			</div>
		""";

		// プログラム初期化
		Ctrl.init();
		Page.init();

		// メインループ開始
		_Main.mainloop();
	}

	// メインループ
	static function mainloop() : void{
		var page = Page.current;

		// イベント処理
		Ctrl.calc();
		Page.calc();
		if(page != null){
			page.calcSerialEvent();
			page.calcParallelEvent();
		}
		Ctrl.draw();
		if(page != null){
			page.drawSerialEvent();
			page.drawParallelEvent();
		}

		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

