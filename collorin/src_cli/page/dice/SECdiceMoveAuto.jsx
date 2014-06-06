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

import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろく移動カートリッジ
class SECdiceMoveAuto implements SerialEventCartridge{
	var _page : PageDice;
	var _chara : Bb3dDiceCharacter;
	var _dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		this._chara = this._page.bcvs.member[response["id"] as string];
		this._dstList = response["dst"] as int[][];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 2.5;
		this._page.bcvs.cameraCenter = [this._chara];
		this._page.bcvs.isTapChara = false;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._page.gauge.setLeft(this._chara, 0);
		this._page.message.set("", "", 0);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "スキップ");
		// トリガーリセット
		Ctrl.trigger_s = false;

		// 移動先設定
		this._chara.dstList = this._dstList;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._chara.dstList.length <= 0){
			// 移動完了
			return false;
		}else if(Ctrl.trigger_s){
			// スキップボタン
			Sound.playSE("ng");
			var x0 = this._chara.x;
			var y0 = this._chara.y;
			var hexx = this._chara.dstList[this._chara.dstList.length - 1][0];
			var hexy = this._chara.dstList[this._chara.dstList.length - 1][1];
			var x1 = this._page.bcvs.field.calcHexCoordx(hexx, hexy);
			var y1 = this._page.bcvs.field.calcHexCoordy(hexx, hexy);
			if(this._chara.dstList.length > 1){
				var hexx = this._chara.dstList[this._chara.dstList.length - 2][0];
				var hexy = this._chara.dstList[this._chara.dstList.length - 2][1];
				var x0 = this._page.bcvs.field.calcHexCoordx(hexx, hexy);
				var y0 = this._page.bcvs.field.calcHexCoordy(hexx, hexy);
			}
			this._chara.r = Math.atan2(y1 - y0, x1 - x0);
			this._chara.x = x1;
			this._chara.y = y1;
			this._chara.motion = "stand";
			this._chara.dstList.length = 0;
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// キャンバス描画
		this._page.bcvs.draw();
		// クロス要素の描画
		this._page.drawCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

