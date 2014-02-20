import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/Dice.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceThrow extends EventCartridge{
	var _page : DicePage;
	var _dice : DrawDice;
	var _rotq1 : number[];
	var _rotq2 : number[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ初期化
		this._dice = new DrawDice(50);
		this._page.ccvs.dices.push(this._dice);
		this._dice.x = -80;
		this._dice.y = 80;
		this._dice.h = 0;
		this._dice.setRandomQuat();
		// さいころ回転のクオータニオン
		this._rotq1 = new number[];
		this._rotq2 = new number[];
		this._dice.setQuat(this._rotq1, 1, 0, 0, -0.4);
		this._dice.setQuat(this._rotq2, 1, 0, 0, 0.4 * 20);
		// トリガーリセット
		Ctrl.trigger_xb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "もどる", "", ""));
		this._page.parallelPush(new PECopenCharacter("player0", 0));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, null, null);

		// さいころ計算
		this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);

		// もどるボタン
		if(Ctrl.trigger_xb){
			this._page.serialPush(new SECdiceTest(this._page));
			exist = false;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._page.ccvs.dices.length = 0;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

