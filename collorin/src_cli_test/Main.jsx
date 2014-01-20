import "timer.jsx";

import "util/Loader.jsx";
import "util/EventCartridge.jsx";
import "util/Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
//		Loader.loadxhr("/", "mypage", function(response : string) : void{
			Page.setPage(new MyPage());
			// ループ開始
			_Main.mainloop();
//		}, function() : void{});
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		// イベント処理
		Page.current.calcSerialEvent();
		Page.current.calcParallelEvent();
		Page.current.drawSerialEvent();
		Page.current.drawParallelEvent();
		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// コンストラクタ
	function constructor(){
	}
}

class MypageTest extends EventCartridge{
	// コンストラクタ
	function constructor(){
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		return true;
	}

	// 描画
	override function draw() : void{
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

