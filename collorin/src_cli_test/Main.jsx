import 'timer.jsx';

import 'util/Loader.jsx';
import 'util/EventCartridge.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class _Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
//		Loader.loadxhr("/", "mypage", function(response : string) : void{
			EventCartridge.reset(new Mypage());
			// ループ開始
			_Main.mainloop();
//		}, function() : void{});
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		// イベント処理
		EventCartridge.calcEvent();
		EventCartridge.drawEvent();
		// 次のフレームへ
		Timer.setTimeout(_Main.mainloop, 33);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Mypage extends EventCartridge{
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

