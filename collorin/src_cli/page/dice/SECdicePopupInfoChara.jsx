import "../../util/EventCartridge.jsx";
import "../core/PartsCharacter.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";
import "DiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページキャラクター情報ポップアップイベントカートリッジ
class SECdicePopupInfoChara extends SECpopupInfoChara{
	var _ccvs : DiceCanvas;
	var _camera : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, data : DiceCharacter, camera : int){
		super(page, cartridge, data);
		this._ccvs = page.ccvs;
		this._camera = camera;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		super.popupInit();

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			ccvs.calc(false, this._camera, null, null);

			// ポップアップ計算
			exist = super.popupCalc(active);
		}

		// キャンバス描画
		return ccvs.draw(exist);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

