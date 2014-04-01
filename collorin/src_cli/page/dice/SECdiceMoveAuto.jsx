import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceMoveAuto extends EventCartridge{
	var _page : DicePage;
	var _chara : DiceCharacter;
	var _dstList : int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, response : variant){
		this._page = page;
		this._chara = this._page.ccvs.member[response["id"] as string];
		this._dstList = response["dst"] as int[][];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = [this._chara];
		// トリガーリセット
		Ctrl.trigger_xb = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "スキップ", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._chara, -1));
		// 移動先設定
		this._chara.dstList = this._dstList;
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, null, null);

		if(this._chara.dstList.length <= 0){
			// 移動完了
			exist = false;
		}else if(Ctrl.trigger_xb){
			// スキップボタン
			Sound.playSE("ng");
			var x0 = this._chara.x;
			var y0 = this._chara.y;
			var hexx = this._chara.dstList[this._chara.dstList.length - 1][0];
			var hexy = this._chara.dstList[this._chara.dstList.length - 1][1];
			var x1 = ccvs.field.calcHexCoordx(hexx, hexy);
			var y1 = ccvs.field.calcHexCoordy(hexx, hexy);
			if(this._chara.dstList.length > 0){
				var hexx = this._chara.dstList[this._chara.dstList.length - 2][0];
				var hexy = this._chara.dstList[this._chara.dstList.length - 2][1];
				var x0 = ccvs.field.calcHexCoordx(hexx, hexy);
				var y0 = ccvs.field.calcHexCoordy(hexx, hexy);
			}
			this._chara.r = Math.atan2(y1 - y0, x1 - x0);
			this._chara.x = x1;
			this._chara.y = y1;
			this._chara.motion = "stand";
			this._chara.dstList.length = 0;
			exist = false;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

