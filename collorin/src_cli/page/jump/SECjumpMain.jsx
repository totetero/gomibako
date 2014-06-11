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
	var _grabx : int;
	var _graby : int;
	var _grabCount : int;

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
		this._grabCount = 0;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;
		bcvs.calcButton(this._btnList);

		if(this._grabCount > 0){this._grabCount--;}
		if(bcvs.player != null){
			// プレイヤーのしゃがみ
			bcvs.player.active = (this._grabCount > 0);
			// プレイヤーの角度
			if(bcvs.player.active){
				var ratio = (this._grabx - Ctrl.stx) / bcvs.w;
				bcvs.player.r = Math.PI * (0.5 + 0.5 * Math.max(Math.min(ratio, 1), -1));
			}
		}
		if(this._stdn != Ctrl.stdn){
			this._stdn = Ctrl.stdn;
			if(this._stdn){
				var x = (bcvs.centerx + bcvs.playerFoothold.x * bcvs.scale) - Ctrl.stx;
				var y = (bcvs.centery - bcvs.playerFoothold.y * bcvs.scale) - Ctrl.sty;
				if(x * x + y * y < 100 * 100){
					// つかみ開始
					this._grabx = Ctrl.stx;
					this._graby = Ctrl.sty;
					this._grabCount = 10;
				}
			}else{
				var x = this._grabx - Ctrl.stx;
				var y = this._graby - Ctrl.sty;
				if(x * x + y * y > 30 * 30 && this._grabCount > 0 && bcvs.player != null){
					// プレイヤーのジャンプ
					var grabPower = (1 + this._grabCount * 0.1) * 0.5;
					bcvs.player.vx = 5.0 * -0.01 * Math.min(x, Ctrl.swmin * 0.5) * grabPower;
					bcvs.player.vy = 5.0 * +0.02 * Math.min(y, Ctrl.shmin * 1.0) * grabPower;
					bcvs.player.action = 0;
					bcvs.player.active = true;
					bcvs.player = null;
				}
				this._grabCount = 0;
			}
		}
		if(bcvs.player == null){this._grabCount = 0;}

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
			var isSquat = (this._grabCount > 0);
			Ctrl.sctx.beginPath();
			var x = isSquat ? this._grabx : bcvs.centerx + bcvs.playerFoothold.x * bcvs.scale;
			var y = isSquat ? this._graby : bcvs.centery - bcvs.playerFoothold.y * bcvs.scale;
			Ctrl.sctx.fillStyle = "rgba(0, 0, 0, 0.3)";
			Ctrl.sctx.arc(x, y, isSquat ? 30 : 100, 0, Math.PI * 2, true);
			Ctrl.sctx.stroke();
			if(this._grabCount > 0){Ctrl.sctx.fill();}
		}
		//*/

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

