import "js/web.jsx";

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

 // さいころ回転
class SECdiceRoll extends EventCartridge{
	var _page : DicePage;
	var _num : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){ // TODO さいころ数 送信データ もどるSEC
		this._page = page;
		this._num = 1;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ初期化
		this._page.ccvs.dices.length = 0;
		for(var i = 0; i < this._num; i++){
			this._page.ccvs.dices.push(new DrawThrowDice(this._num, i));
		}
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

		// なげるボタン
		if(Ctrl.trigger_zb){
			this._page.serialPush(new SECdiceThrow(this._page));
			exist = false;
		}

		// もどるボタン
		if(Ctrl.trigger_xb){
			this._page.ccvs.dices.length = 0;
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
	}
}

// さいころ投擲
class SECdiceThrow extends EventCartridge{
	var _page : DicePage;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ設定
		for(var i = 0; i < this._page.ccvs.dices.length; i++){this._page.ccvs.dices[i].start();}
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

		// さいころ完了確認
		var throwing = false;
		for(var i = 0; i < ccvs.dices.length; i++){throwing = throwing || ccvs.dices[i].throwing;}

		// 演出終了もしくはスキップボタン
		if(!throwing || Ctrl.trigger_xb){
			this._page.ccvs.dices.length = 0;
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
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

