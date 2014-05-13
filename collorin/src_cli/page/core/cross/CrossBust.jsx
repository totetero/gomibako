import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

import "../data/DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 立ち絵クラス カートリッジをまたぐクロス要素
class CrossBust{
	static const _actionMax = 10;

	var _ctx : CanvasRenderingContext2D;
	var _currentChara : DataChara;
	var _nextChara : DataChara;
	var _action = -CrossBust._actionMax;
	var _tempAction : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// キャンバス作成
		var cvs = dom.document.createElement("canvas") as HTMLCanvasElement;
		this._ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
		cvs.width = 320;
		cvs.height = 480;
		cvs.style.width = 160 + "px";
		cvs.style.height = 240 + "px";
		(dom.document.getElementById("bust") as HTMLDivElement).appendChild(cvs);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 展開処理
		if(this._action > 0 || (0 > this._action && this._nextChara != null)){this._action++;}
		if(this._action > CrossBust._actionMax){this._action = -CrossBust._actionMax;}
		if(this._action == -CrossBust._actionMax && this._nextChara != null){this._currentChara = this._nextChara;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(this._tempAction == this._action){return;}
		this._tempAction = this._action;

		this._ctx.clearRect(0, 0, 320, 480);
		if(this._currentChara != null){
			var img = Loader.imgs["img_chara_bust_" + this._currentChara.code];
			var x = -320 * Math.abs(this._action / CrossBust._actionMax);
			this._ctx.drawImage(img, x, 0);
		}
	}

	// ----------------------------------------------------------------
	// 表示設定
	function set(nextChara : DataChara) : void{
		if(this._nextChara != nextChara){
			this._nextChara = nextChara;
			this._action = (this._action == 0) ? 1 : Math.abs(this._action);
		}

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._action = (this._nextChara != null) ? 0 : -CrossBust._actionMax;
			this._currentChara = this._nextChara;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

