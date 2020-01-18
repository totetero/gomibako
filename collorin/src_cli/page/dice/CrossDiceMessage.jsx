import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくメッセージクラス カートリッジをまたぐクロス要素
class CrossDiceMessage{
	static const _actionMax = 10;

	var _label : PartsLabel;
	var _nextText : string;
	var _code : string;
	var _show : boolean;
	var _action = CrossDiceMessage._actionMax;
	var _frame : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this._label = new PartsLabel("", 0, 0, 0, 0);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 展開処理
		if(this._action > 0 || (0 > this._action && this._show)){this._action++;}
		if(this._action == 0 && this._frame > 0 && --this._frame == 0){this.set("", "", 0);}
		if(this._action > CrossDiceMessage._actionMax){this._action = -CrossDiceMessage._actionMax;}
		if(this._action == -CrossDiceMessage._actionMax){this._toggle();}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 遷移座標計算
		var my = 50 * Math.abs(this._action / CrossDiceMessage._actionMax);
		if(my >= 50){return;}

		var w = 310;
		var h = 30;
		var x = (Ctrl.screen.w - w) * 0.5;
		var y = 5 - my;
		// 箱描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], x, y, w, h);
		// 文字列描画
		this._label.x = x;
		this._label.y = y;
		this._label.w = w;
		this._label.h = h;
		this._label.draw();
	}

	// ----------------------------------------------------------------
	// 表示設定
	function set(text : string, code : string, frame : int) : void{
		if(this._nextText != text){
			this._nextText = text;
			this._action = (this._action == 0) ? 1 : Math.abs(this._action);
		}
		this._show = (this._nextText != "");
		this._frame = frame;

		// 演出スキップ確認
		var codeSkip = (code != "" && this._code == code);
		var settingSkip = dom.window.localStorage.getItem("setting_transition") == "off";
		if(codeSkip || settingSkip){
			this._action = this._show ? 0 : CrossDiceMessage._actionMax;
			this._toggle();
		}
		this._code = code;
	}

	// ----------------------------------------------------------------
	// 切り替え
	function _toggle() : void{
		if(!this._show){return;}
		this._label.setText(this._nextText);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

