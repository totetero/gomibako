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

class SECdiceCharge extends EventCartridge{
	var _page : DicePage;
	var _rotq1 = new number[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ初期化
		var dice = new DrawDice(50);
		dice.x = -80;
		dice.y = 80;
		dice.h = 0;
		dice.setRandomQuat();
		this._page.ccvs.dices.push(dice);
		// さいころ回転のクオータニオン
		DrawDice.setQuat(this._rotq1, 1, 0, 0, -0.4);
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_xb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("なげる", "もどる", "", ""));
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
		DrawDice.multiQuat(ccvs.dices[0].rotq, this._rotq1, ccvs.dices[0].rotq);

		// なげるボタン
		if(Ctrl.trigger_zb){
			this._page.serialPush(new SECdiceThrow(this._page, [1]));
			exist = false;
		}

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

class ExDrawDice extends DrawDice{
	static var _rotq1 : number[];
	static var _rotq2 : number[];
	var _action = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(num : int, index : int){
		super(50);
		this.x = -80;
		this.y = 80;
		this.h = 0;
		this.setRandomQuat();

		// さいころ回転のクオータニオン
		if(ExDrawDice._rotq1 == null){
			ExDrawDice._rotq1 = new number[];
			ExDrawDice._rotq2 = new number[];
			DrawDice.setQuat(ExDrawDice._rotq1, 1, 0, 0, -0.4);
			DrawDice.setQuat(ExDrawDice._rotq2, 1, 0, 0, 0.4 * 20);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
	}
}


class SECdiceThrow extends EventCartridge{
	var _page : DicePage;
	var _dice = new ExDrawDice[];
	var _rotq1 = new number[];
	var _rotq2 = new number[];
	var _pip : int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, pip : int[]){
		this._page = page;
		this._pip = pip;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		for(var i = 0; i < this._pip.length; i++){
			// さいころ獲得
			var dice = new ExDrawDice(this._pip.length, i);
			this._dice.push(dice);
			this._page.ccvs.dices.push(dice);
		}
		// さいころ回転のクオータニオン
		DrawDice.setQuat(this._rotq1, 1, 0, 0, -0.4);
		DrawDice.setQuat(this._rotq2, 1, 0, 0, 0.4 * 20);
		// トリガーリセット
		Ctrl.trigger_xb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "スキップ", "", ""));
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
		DrawDice.multiQuat(ccvs.dices[0].rotq, this._rotq1, ccvs.dices[0].rotq);

		// スキップボタン
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

