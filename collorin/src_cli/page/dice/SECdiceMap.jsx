import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "SECdicePopupInfoChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceMap extends EventCartridge{
	var _page : DicePage;
	var _cartridge : EventCartridge;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge){
		this._page = page;
		this._cartridge = cartridge;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// 中心キャラクター設定
		this._page.ccvs.center = null;
		// トリガーリセット
		Ctrl.trigger_sb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", "戻る"));
		this._page.parallelPush(new PECopenCharacter("", ""));
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			ccvs.calc(true, 1, function() : void{
				// フィールド押下
				var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
				log "field " + hex.x + " " + hex.y;
			}, function() : void{
				// キャラクター押下
				Sound.playSE("ok");
				this._page.serialPush(new SECdicePopupInfoChara(this._page, this, ccvs.member[ccvs.tappedCharacter], 1));
				exist = false;
			});

			// もどるボタン
			if(Ctrl.trigger_sb){
				Sound.playSE("ng");
				this._page.serialPush(this._cartridge);
				exist = false;
			}
		}

		// キャンバス描画
		return ccvs.draw(exist);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

