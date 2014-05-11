import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopupMenu.jsx";

import "PageDice.jsx";
import "Bb3dDiceCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくカートリッジ
class SECdiceMain implements SerialEventCartridge{
	var _page : PageDice;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice){
		this._page = page;

		// ボタン作成
		this._btnList["world"] = new PartsButtonBasic("もどる",  250, 10, 60, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラ表示
		this._page.ctrler.setLctrl(true);
		this._page.ctrler.setRctrl("テスト01", "テスト02", "テスト03", "テスト04");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// ボタン押下処理
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

