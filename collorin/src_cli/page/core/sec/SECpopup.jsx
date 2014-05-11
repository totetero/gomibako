import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

import "../Page.jsx";
import "SECloadTransition.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ポップアップに展開演出を付与する
abstract class SECpopup implements SerialEventCartridge{
	static const _openStepMax = 5;

	// ポップアップの親カートリッジ
	var parentCartridge : SerialEventCartridge;
	var close = true; // 閉じる演出の有無 さらにポップアップを展開する場合はfalse

	var _openStep = SECpopup._openStepMax;

	abstract function popupCalc() : boolean;
	abstract function popupDraw() : void;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(cartridge : SerialEventCartridge){
		this.parentCartridge = cartridge;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// 前遷移スキップ確認
		if(this._openStep >= SECpopup._openStepMax){this._openStep = -SECpopup._openStepMax;}
		if(this._openStep == -SECpopup._openStepMax && this._checkSkip()){this._openStep = 0;}
		// 前後遷移中処理
		if(this._openStep != 0){this._openStep++;}
		// 前遷移完了後の通常処理
		if(this._openStep == 0 && !this.popupCalc()){if(this.close){this._openStep = 1;}else{this.close = true; return false;}}
		// 後遷移スキップ確認
		if(this._openStep == 1 && this._checkSkip()){this._openStep = SECpopup._openStepMax;}
		// 後遷移完了確認
		return this._openStep < SECpopup._openStepMax;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		var num = this._openStep / SECpopup._openStepMax;

		// 親カートリッジを最初に描画
		this.parentCartridge.draw();
		// ページ遷移中の場合ポップアップ描画キャンセル
		if(SECloadTransition.invisiblePopup){return;}

		// 暗幕
		Ctrl.sctx.fillStyle = "rgba(0, 0, 0, " + (0.5 * (1 - Math.abs(num))) + ")";
		Ctrl.sctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);

		if(this._openStep == 0){
			// 通常描画
			this.popupDraw();
		}else{
			// 遷移演出
			Ctrl.sctx.save();
			Ctrl.sctx.globalAlpha = 1 - Math.abs(num); // popupでアルファを使うときは気をつけること ていうかできるだけglobalAlphaは使いたくない
			Ctrl.sctx.translate(Math.abs(num) * num * 50, 0);
			this.popupDraw();
			Ctrl.sctx.restore();
		}
	}

	// ----------------------------------------------------------------
	// スキップの確認	
	function _checkSkip() : boolean{
		return (dom.window.localStorage.getItem("setting_transition") == "off");
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

