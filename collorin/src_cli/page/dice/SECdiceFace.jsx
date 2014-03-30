import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/DrawEffect.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";
import "SECdiceCommand.jsx";
import "SECdiceMap.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceFace extends EventCartridge{
	var _page : DicePage;
	var _chara0 : DiceCharacter;
	var _chara1 : DiceCharacter;
	var _mode : int = 0;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, chara0 : DiceCharacter, chara1 : DiceCharacter){
		this._page = page;
		this._chara0 = chara0;
		this._chara1 = chara1;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = [this._chara0, this._chara1];
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._chara0, -1));
		this._page.parallelPush(new PECdiceEnemyGauge(this._page, this._chara1, -1));
		// キャラクターが向き合う
		var r = Math.atan2(this._chara1.y - this._chara0.y, this._chara1.x - this._chara0.x);
		this._chara0.r = r;
		this._chara1.r = r + Math.PI;
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, (this._mode == 0 || this._mode == 1) ? 2 : 0, null, null);

		switch(this._mode){
			case 0:
				// アクション前半
				this._chara0.motion = "attack1";
				this._chara0.action = this._action;
				if(++this._action >= 10){
					this._mode = 1;
					this._action = 0;
					// テスト
					this._chara1.hp -= 30;
					this._page.parallelPush(new PECdiceEnemyGauge(this._page, this._chara1, -1));
					for(var i = 0; i < 3; i++){
						this._page.ccvs.pushEffect(new DrawEffectHopImage(this._chara1.x, this._chara1.y));
					}
				}
				break;
			case 1:
				// アクション後半
				this._chara0.motion = "attack2";
				this._chara0.action = this._action;
				this._chara1.motion = "damage";
				this._chara1.action = this._action;
				if(++this._action >= 10){
					this._mode = 2;
					this._action = 0;
				}
				break;
			case 2:
				// アクション完了後
				this._chara0.motion = "stand";
				this._chara1.motion = "stand";
				if(++this._action >= 10){
//					this._page.serialPush(new SECdiceCommand(this._page));
					exist = false;
				}
				break;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._chara0, 90));
		this._page.parallelPush(new PECdiceEnemyGauge(this._page, this._chara1, 90));
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

