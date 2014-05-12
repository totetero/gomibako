import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/parts/PartsButton.jsx";
import "../core/data/DataChara.jsx";
import "../core/sec/SECpopupMenu.jsx";

import "PageDice.jsx";
import "Bb3dDiceCanvas.jsx";
import "Bb3dDiceCharacter.jsx";
import "SECdiceMap.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくコマンド入力待ちカートリッジ
class SECdiceCommand implements SerialEventCartridge{
	var _page : PageDice;
	var _player : Bb3dDiceCharacter;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		this._player = this._page.bcvs.member[response["id"] as string];

		// ボタン作成
		this._btnList["lchara"] = new PartsButton(0, 0, 50, 50, true);
		this._btnList["back"] = new PartsButtonBasic("もどる", 250, 10, 60, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 2.5;
		this._page.bcvs.cameraCenter = [this._player];
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapHex = true;
		// ゲージ設定
		this._page.gauge.setLeft(this._player, -1);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
		this._page.ctrler.z_Trigger = false;
		this._page.ctrler.x_Trigger = false;
		this._page.ctrler.c_Trigger = false;
		this._page.ctrler.s_Trigger = false;
		// コントローラ表示
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("さいころ", "スキル", "マップ", "メニュー");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._page.bcvs.calcButton(this._btnList);
		this._page.gauge.lActive = this._btnList["lchara"].active;

		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// ゲージアイコンタップ
		var btn = this._btnList["lchara"];
		if(btn.trigger){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.lChara));
			return false;
		}

		// マップボタン
		if(this._page.ctrler.c_Trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceMap(this._page, this));
			return false;
		}

		// もどるボタン押下処理
		var btn = this._btnList["back"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			Page.transitionsPage("world");
			return true;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 画面クリア
		Ctrl.sctx.clearRect(0, 0, Ctrl.sw, Ctrl.sh);
		// ゲージ描画
		this._page.gauge.draw();

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// ヘッダ描画
		this._page.header.draw();
		// キャンバス描画
		this._page.bcvs.draw();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

