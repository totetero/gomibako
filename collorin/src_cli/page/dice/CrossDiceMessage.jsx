import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくメッセージクラス カートリッジをまたぐクロス要素
class CrossDiceMessage{
	static const _actionMax = 10;

	var _currentTextCvs : HTMLCanvasElement;
	var _nextText : string;
	var _skip : boolean;
	var _action = CrossDiceMessage._actionMax;
	var _frame : int;

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 展開処理
		if(this._action > 0 || (0 > this._action && this._nextText != "")){this._action++;}
		if(this._action == 0 && this._frame > 0 && --this._frame == 0){this._nextText = ""; this._action = this._skip ? CrossDiceMessage._actionMax : 1;}
		if(this._action > CrossDiceMessage._actionMax){this._action = -CrossDiceMessage._actionMax;}
		if(this._action == -CrossDiceMessage._actionMax && this._nextText != ""){this._currentTextCvs = null;}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 遷移座標計算
		var my = 50 * Math.abs(this._action / CrossDiceMessage._actionMax);
		if(my >= 50){return;}

		// 箱描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], 5, 5 - my, 310, 30);
		// 文字列描画
		if(this._nextText != "" || this._currentTextCvs != null){
			var pixelRatio = 2;
			if(this._currentTextCvs == null){this._currentTextCvs = Drawer.createText(this._nextText, 18 * pixelRatio, "black", 200 * pixelRatio);}
			var w = this._currentTextCvs.width / pixelRatio;
			var h = this._currentTextCvs.height / pixelRatio;
			var x = 5 + (310 - w) * 0.5;
			var y = 5 + (30 - h) * 0.5 - my;
			Ctrl.sctx.drawImage(this._currentTextCvs, x, y, w, h);
		}
	}

	// ----------------------------------------------------------------
	// 表示設定
	function set(text : string, frame : int) : void{
		if(this._nextText != text){
			this._nextText = text;
			this._action = (this._action == 0) ? 1 : Math.abs(this._action);
		}
		this._frame = frame;

		// 演出スキップ確認
		this._skip = (dom.window.localStorage.getItem("setting_transition") == "off");
		if(this._skip){
			this._action = (this._nextText != "") ? 0 : -CrossDiceMessage._actionMax;
			this._currentTextCvs = null;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

