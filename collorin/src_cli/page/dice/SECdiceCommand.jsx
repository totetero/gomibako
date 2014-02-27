import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";
import "SECdiceMap.jsx";
import "SECdiceThrow.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceCommand extends EventCartridge{
	var _page : DicePage;
	var _player : DiceCharacter;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
		this._player = this._page.ccvs.member[0][0];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = [this._player];
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_cb = false;
		Ctrl.trigger_sb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("さいころ", "", "マップ", "メニュー"));
		this._page.parallelPush(new PECopenCharacter(this._player.code, 0));
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
			log ccvs.member[ccvs.tappedType][ccvs.tappedCharacter];
		});

		// さいころボタン
		if(Ctrl.trigger_zb){
			this._page.serialPush(new SECdiceRoll(this._page, this));
			exist = false;
		}

		// マップボタン
		if(Ctrl.trigger_cb){
			this._page.serialPush(new SECdiceMap(this._page, this));
			exist = false;
		}

		// メニューボタン
		if(Ctrl.trigger_sb){
			Ctrl.trigger_sb = false;
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

