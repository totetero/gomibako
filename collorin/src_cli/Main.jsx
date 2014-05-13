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
		// タイトル設定
		dom.document.title = "コロリン";
		// css設定
		var style = dom.document.createElement("style") as HTMLStyleElement;
		style.type = "text/css";
		style.innerHTML = """
			body{
				margin: 0;
				overflow: hidden;
				background-color: gray;
			}
			#main{
				position: absolute;
				left: 50%;
				top: 50%;
			}
			#bust{
				position: absolute;
				left: 0px;
				bottom: 0px;
				width: 160px;
				height: 240px;
				//background-color: rgba(0,0,0,0.3);
			}
			#ctrl{
				position: absolute;
				width: 100%;
				height: 100%;
				overflow: hidden;
			}
			#lctrl{
				position: absolute;
				left: -144px;
				bottom: 0px;
				width: 144px;
				height: 144px;
				//background-color: rgba(0,0,0,0.3);
			}
			#rctrl{
				position: absolute;
				right: -144px;
				bottom: 0px;
				width: 144px;
				height: 144px;
				//background-color: rgba(0,0,0,0.3);
			}
			#loading{
				position: absolute;
				display: block;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.5);
			}
			#loading::before{
				content: attr(txt);
				position: absolute;
				left: 50%;
				top: 50%;
				width: 80px;
				height: 30px;
				line-height: 32px;
				margin-left: -40px;
				margin-top: -15px;
				padding-left: 10px;
				color: white;
				background-color: black;
			}
			input{display: none;}
			input.textarea{
				position: absolute;
				display: block;
				left: 50%;
				margin-left: -140px;
				width: 280px;
				height: 30px;
				font-size: 16px;
				text-align: center;
				box-sizing: border-box;
				-webkit-box-sizing: border-box;
				-moz-box-sizing: border-box;
			}
		""";
		dom.document.head.appendChild(style);
		// dom設定
		dom.document.body.innerHTML = """
			<div id="main"></div>
			<div id="bust"></div>
			<div id="ctrl">
				<div id="lctrl"></div>
				<div id="rctrl"></div>
				<input>
			</div>
			<div id="loading" txt="loading"></div>
		""";

		// 初期化
		Ctrl.init();
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

