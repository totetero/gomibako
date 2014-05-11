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
		this._btnList["world"] = new PartsButtonBasic("もどる",  250, 10, 60, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// 中心キャラクター設定
		this._page.bcvs.center = [this._player];
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
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// キャラクタータップ
		if(this._page.bcvs.charaTrigger != null){
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

		// テストボタン押下処理
		var list = ["world"];
		for(var i = 0; i < list.length; i++){
			var btn = this._btnList[list[i]];
			if(btn.trigger){
				btn.trigger = false;
				Sound.playSE("ok");
				Page.transitionsPage(list[i]);
				return true;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 画面クリア
		Ctrl.sctx.clearRect(0, 0, Ctrl.sw, Ctrl.sh);

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

