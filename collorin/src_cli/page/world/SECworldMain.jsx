import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/parts/PartsButton.jsx";
import "../core/sec/SECpopupMenu.jsx";

import "PageWorld.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ワールドカートリッジ
class SECworldMain implements SerialEventCartridge{
	var _page : PageWorld;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageWorld){
		this._page = page;

		// ボタン作成
		this._btnList["dice"] = new PartsButtonBasic("テストステージ",  60, 70, 200, 40);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.header.lbtn.trigger = false;
		this._page.header.rbtn.trigger = false;
		// コントローラとじてる
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// ヘッダ有効化
		this._page.header.setActive(true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// ボタン押下処理
		var list = ["dice"];
		for(var i = 0; i < list.length; i++){
			if(this._btnList[list[i]].trigger){
				Sound.playSE("ok");
				Page.transitionsPage(list[i]);
				return true;
			}
		}

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

