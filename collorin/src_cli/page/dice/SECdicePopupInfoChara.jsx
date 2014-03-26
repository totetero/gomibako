import "../../util/EventCartridge.jsx";
import "../page/PartsCharacter.jsx";
import "../page/Transition.jsx";

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
		// キャンバス計算
		this._ccvs.calc(false, this._camera, null, null);

		// ポップアップ計算
		var exist = super.popupCalc(active);

		// キャンバス描画
		this._ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

