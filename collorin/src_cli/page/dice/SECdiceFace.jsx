import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろく移動カートリッジ
class SECdiceFace implements SerialEventCartridge{
	var _page : PageDice;
	var _chara0 : Bb3dDiceCharacter;
	var _chara1 : Bb3dDiceCharacter;
	var _value : int;
	var _mode : int = 0;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		this._chara0 = this._page.bcvs.member[response["id0"] as string];
		this._chara1 = this._page.bcvs.member[response["id1"] as string];
		this._value = response["value"] as int;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 4;
		this._page.bcvs.cameraCenter = [this._chara0, this._chara1];
		this._page.bcvs.isTapChara = false;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._page.message.set("", -1);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");

		// キャラクターが向き合う
		var r = Math.atan2(this._chara1.y - this._chara0.y, this._chara1.x - this._chara0.x);
		this._chara0.r = r;
		this._chara1.r = r + Math.PI;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		switch(this._mode){
			case 0:
				// アクション前半
				this._chara0.motion = "attack1";
				this._chara0.action = this._action;
				if(++this._action >= 10){
					this._mode = 1;
					this._action = 0;
				}
				break;
			case 1:
				// アクション後半
				if(this._action == 0){
					// テスト
					this._chara1.hp -= this._value;
//					ccvs.pushEffect(new DrawEffectHopNumber(this._value as string, this._chara1.x, this._chara1.y));
//					this._setGauge(-1);
//					// エフェクト
//					for(var i = 0; i < 3; i++){
//						ccvs.pushEffect(new DrawEffectHopImage(this._chara1.x, this._chara1.y));
//					}
				}
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
				if(this._action == 0){
					this._chara0.motion = "stand";
					this._chara1.motion = "stand";
				}
				if(++this._action >= 10){
					this._mode = 3;
				}
				break;
			case 3:
				return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.drawBeforeCross();
		this._page.drawAfterCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

