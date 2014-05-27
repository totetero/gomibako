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

	var _currentChara : DataChara;
	var _nextChara : DataChara;
	var _show : boolean;
	var _action = CrossBust._actionMax;

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		var tempAction = this._action;

		// 展開処理
		if(this._action > 0 || (0 > this._action && this._show)){this._action++;}
		if(this._action > CrossBust._actionMax){this._action = -CrossBust._actionMax;}
		if(this._action == -CrossBust._actionMax){this._toggle();}

		if(tempAction != this._action){Ctrl.update_lctx = true;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(Ctrl.update_lctx && this._currentChara != null){
			var img = Loader.imgs["img_chara_bust_" + this._currentChara.code];
			var mx = -160 * Math.abs(this._action / CrossBust._actionMax);
			Ctrl.lctx.drawImage(img, mx, 0, 160, 240);
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
		if(!this._show){return;}
		this._currentChara = this._nextChara;
		Ctrl.update_lctx = true;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

