import "../../util/EventCartridge.jsx";
import "../core/PartsCharacter.jsx";
import "../core/Transition.jsx";

import "ChatPage.jsx";
import "ChatCanvas.jsx";
import "ChatCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページキャラクター情報ポップアップイベントカートリッジ
class SECchatPopupInfoChara extends SECpopupInfoChara{
	var _ccvs : ChatCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, cartridge : EventCartridge, data : ChatCharacter){
		super(page, cartridge, data);
		this._ccvs = page.ccvs;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		super.popupInit();

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			this._ccvs.calc(false, null, null);

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

