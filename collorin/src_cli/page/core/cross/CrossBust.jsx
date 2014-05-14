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

	var _currentChara : DataChara;
	var _nextChara : DataChara;
	var _action = -CrossBust._actionMax;

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		var tempAction = this._action;

		// 展開処理
		if(this._action > 0 || (0 > this._action && this._nextChara != null)){this._action++;}
		if(this._action > CrossBust._actionMax){this._action = -CrossBust._actionMax;}
		if(this._action == -CrossBust._actionMax && this._nextChara != null){this._currentChara = this._nextChara;}

		if(tempAction != this._action){Ctrl.clUpdate = true;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(Ctrl.clUpdate && this._currentChara != null){
			var img = Loader.imgs["img_chara_bust_" + this._currentChara.code];
			var x = -160 * Math.abs(this._action / CrossBust._actionMax);
			Ctrl.clctx.drawImage(img, x, 0, 160, 240);
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

