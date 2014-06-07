import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

import "../data/chara/DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 立ち絵クラス カートリッジをまたぐクロス要素
class CrossBust{
	static const _actionMax = 10;

	var _div : HTMLDivElement;
	var _nextChara : DataChara;
	var _show : boolean;
	var _action = CrossBust._actionMax;
	var _beforeAction : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// css設定
		var style = dom.document.createElement("style") as HTMLStyleElement;
		style.type = "text/css";
		style.innerHTML = """
			#cross .bust{
				position: absolute;
				left: 0px;
				bottom: 0px;
				width: 160px;
				height: 240px;
				background-size: 160px 240px;
			}
		""";
		dom.document.head.appendChild(style);
		// dom設定
		this._div = dom.document.createElement("div") as HTMLDivElement;
		(dom.document.getElementById("cross") as HTMLDivElement).appendChild(this._div);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 展開処理
		if(this._action > 0 || (0 > this._action && this._show)){this._action++;}
		if(this._action > CrossBust._actionMax){this._action = -CrossBust._actionMax;}
		if(this._action == -CrossBust._actionMax){this._toggle();}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(this._beforeAction != this._action){
			this._beforeAction = this._action;
			this._div.style.left = (-160 * Math.abs(this._action / CrossBust._actionMax)) + "px";
		}
	}

	// ----------------------------------------------------------------
	// 表示設定
	function set(nextChara : DataChara) : void{
		if(this._nextChara != nextChara){
			this._nextChara = nextChara;
			this._action = (this._action == 0) ? 1 : Math.abs(this._action);
		}
		this._show = (this._nextChara != null);

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._action = this._show ? 0 : CrossBust._actionMax;
			this._toggle();
		}
	}

	// ----------------------------------------------------------------
	// 切り替え
	function _toggle() : void{
		this._div.className = "bust" + (this._show ? (" cssimg_chara_bust_" + this._nextChara.code) : "");
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

