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

import "PageMypage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストイベントカートリッジ
class SECmypageMain implements SerialEventCartridge{
	var _page : PageMypage;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageMypage){
		this._page = page;

		// ボタン作成
		this._btnList["test1"] = new PartsButtonBasic("ボタン1",  10, 400, 100, 30);
		this._btnList["test2"] = new PartsButtonBasic("ボタン2",  10, 440, 100, 30);
		this._btnList["test3"] = new PartsButtonBasic("ボタン3", 210, 400, 100, 30);
		this._btnList["test4"] = new PartsButtonBasic("ボタン4", 210, 440, 100, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ヘッダ有効化
		this._page.header.setActive(true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テストボタン押下処理
		var btn = this._btnList["test1"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			Page.transitionsPage("test");
			return true;
		}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			this._page.header.lbtn.trigger = false;
			dom.document.location.href = "/top";
			return false;
		}

		// 右ヘッダメニューボタン押下処理
		if(this._page.header.rbtn.trigger){
			this._page.header.rbtn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		for(var name in this._btnList){
			var btn = this._btnList[name];
			btn.x = btn.basex + (Ctrl.sw - 320);
			btn.y = btn.basey + (Ctrl.sh - 480);
		}

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);

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

