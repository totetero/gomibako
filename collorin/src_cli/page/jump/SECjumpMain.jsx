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
		this._grab = 0;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;
		bcvs.calcButton(this._btnList);

		var x = bcvs.centerx + bcvs.playerFoothold.x * bcvs.scale - Ctrl.stx;
		var y = bcvs.centery - bcvs.playerFoothold.y * bcvs.scale - Ctrl.sty;
		if(this._grab > 0){this._grab--;}
		if(bcvs.player != null){
			var isSquat = (this._grab > 0);
			// プレイヤーのしゃがみ
			bcvs.player.active = isSquat;
			// プレイヤーの角度
			if(isSquat){bcvs.player.r = Math.PI * (0.5 + 0.5 * Math.max(Math.min(x / bcvs.w, 1), -1));}
		}
		if(this._stdn != Ctrl.stdn){
			this._stdn = Ctrl.stdn;
			var r = Math.sqrt(x * x + y * y);
			if(this._stdn){if(r < 50){this._grab = 10;}}
			else{
				if(r > 50 && this._grab > 0 && bcvs.player != null){
					// プレイヤーのジャンプ
					var grabPower = (1 + this._grab * 0.1) * 0.5;
					bcvs.player.vx = 5.0 * -0.01 * Math.min(x, Ctrl.swmin * 0.5) * grabPower;
					bcvs.player.vy = 5.0 * +0.02 * Math.min(y, Ctrl.shmin * 1.0) * grabPower;
					bcvs.player.action = 0;
					bcvs.player.active = true;
					bcvs.player = null;
				}
				this._grab = 0;
			}
		}
		if(bcvs.player == null){this._grab = 0;}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// キャンバス描画
		this._page.bcvs.draw();

		/*
		var bcvs = this._page.bcvs;
		if(bcvs.player != null){
			Ctrl.sctx.beginPath();
			var x = bcvs.centerx + bcvs.playerFoothold.x * bcvs.scale;
			var y = bcvs.centery - bcvs.playerFoothold.y * bcvs.scale;
			Ctrl.sctx.fillStyle = "rgba(0,0,0,0.3)";
			Ctrl.sctx.arc(x, y, 50, 0, Math.PI * 2, true);
			Ctrl.sctx.stroke();
			if(this._grab > 0){Ctrl.sctx.fill();}
		}
		*/

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// ヘッダ描画
		this._page.header.draw();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

