import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";

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
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = null;
		// トリガーリセット
		Ctrl.trigger_xb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "もどる", "", ""));
		this._page.parallelPush(new PECopenCharacter("", 0));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 1, function() : void{
			// フィールド押下
			var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			log "field " + hex.x + " " + hex.y;
		}, function() : void{
			// キャラクター押下
			log ccvs.member[ccvs.tappedType][ccvs.tappedCharacter];
		});

		// もどるボタン
		if(Ctrl.trigger_xb){
			this._page.serialPush(this._cartridge);
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

