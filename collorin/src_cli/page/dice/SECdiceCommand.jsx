import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";
import "SECdiceMap.jsx";
import "SECdiceDice.jsx";
import "SECdicePopupSkill.jsx";
import "SECdicePopupMenu.jsx";
import "SECdicePopupInfoChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceCommand extends EventCartridge{
	var _page : DicePage;
	var _player : DiceCharacter;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, response : variant){
		this._page = page;
		this._player = this._page.ccvs.member[response["id"] as string];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = [this._player];
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_xb = false;
		Ctrl.trigger_cb = false;
		Ctrl.trigger_sb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("さいころ", "スキル", "マップ", "メニュー"));
		this._page.parallelPush(new PECopenCharacter(this._player.code, "normal"));
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._player, -1));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, function() : void{
			// フィールド押下
			var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			log "field " + hex.x + " " + hex.y;
		}, function() : void{
			// キャラクター押下
			Sound.playSE("ok");
			this._page.serialPush(new SECdicePopupInfoChara(this._page, this, ccvs.member[ccvs.tappedCharacter], 0));
			exist = false;
		});

		// さいころボタン
		if(Ctrl.trigger_zb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceRoll(this._page, this, "", {
				"type": "dice",
				"num": 1,
				"fix": 0,
			}));
			exist = false;
		}

		// スキルボタン
		if(Ctrl.trigger_xb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdicePopupSkill(this._page, this, this._player));
			exist = false;
		}

		// マップボタン
		if(Ctrl.trigger_cb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceMap(this._page, this));
			exist = false;
		}

		// メニューボタン
		if(Ctrl.trigger_sb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdicePopupMenu(this._page, this, 0));
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

