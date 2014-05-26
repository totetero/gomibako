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

import "../core/popup/SECpopupMenu.jsx";
import "PageItem.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// アイテムカートリッジ
class SECitemMain implements SerialEventCartridge{
	var _page : PageItem;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageItem, response : variant){
		this._page = page;

		// ボタン作成
		this._btnList["test"] = new PartsButtonBasic("アイテム",  20, 70, 200, 40);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		this._page.header.setActive(true);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.header.lbtn.trigger = false;
		this._page.header.rbtn.trigger = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this._page.header.rbtn.trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.screen.w, Ctrl.screen.h);

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

