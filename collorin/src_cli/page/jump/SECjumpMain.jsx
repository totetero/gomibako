import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "PageJump.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ジャンプカートリッジ
class SECjumpMain implements SerialEventCartridge{
	var _page : PageJump;
	var _btnList = {} : Map.<PartsButton>;

	var _stdn : boolean;
	var _grab : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageJump, response : variant){
		this._page = page;

		// ボタン作成
		this._btnList["test"] = new PartsButtonBasic("ジャンプ",  10, 10, 200, 40);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.isTapChara = true;
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._page.bcvs.calcButton(this._btnList);

		var bcvs = this._page.bcvs;
		var player = bcvs.member[0];
		if(this._grab > 0){this._grab--;}
		if(this._stdn != Ctrl.stdn){
			this._stdn = Ctrl.stdn;
			var x = bcvs.centerx - Ctrl.stx;
			var y = bcvs.centery - Ctrl.sty;
			var r = Math.sqrt(x * x + y * y);
			if(this._stdn){
				if(r < 50){this._grab = 10;}
			}else{
				if(r > 50 && this._grab > 0){
					// プレイヤーのジャンプ
					var grabPower = (1 + this._grab * 0.1) * 0.5;
					player.vx = 5.0 * -0.01 * Math.min(x, Ctrl.swmin * 0.5) * grabPower;
					player.vy = 5.0 * +0.02 * Math.min(y, Ctrl.shmin * 1.0) * grabPower;
					player.ground = false;
				}
				this._grab = 0;
			}
		}
		if(!player.ground){this._grab = 0;}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.drawBeforeCross();

		/*
		var bcvs = this._page.bcvs;
		var player = bcvs.member[0];
		if(player.ground){
			Ctrl.sctx.beginPath();
			Ctrl.sctx.arc(bcvs.centerx, bcvs.centery, 50, 0, Math.PI * 2, true);
			Ctrl.sctx.stroke();
			if(this._grab > 0){Ctrl.sctx.fill();}
		}
		*/

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

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

