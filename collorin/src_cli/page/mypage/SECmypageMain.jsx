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
import "PageMypage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// マイページカートリッジ
class SECmypageMain implements SerialEventCartridge{
	var _page : PageMypage;
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageMypage, response : variant){
		this._page = page;

		// ボタン作成
		this._btnList["world"] = new PartsButtonBasic("ワールド",  10, -130, 100, 30);
		this._btnList["quest"] = new PartsButtonBasic("クエスト",  10, -90, 100, 30);
		this._btnList["chara"] = new PartsButtonBasic("キャラクタ", -110, -130, 100, 30);
		this._btnList["item"] = new PartsButtonBasic("アイテム", -110, -90, 100, 30);

		this._btnList["quest"].inactive = true;
		this._btnList["item"].inactive = true;
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

		// ボタン押下処理
		var list = ["world", "quest", "chara", "item"];
		for(var i = 0; i < list.length; i++){
			if(this._btnList[list[i]].trigger){
				Sound.playSE("ok");
				Page.transitionsPage(list[i]);
				return true;
			}
		}

		// 左ヘッダ戻るボタン押下処理
		if(this._page.header.lbtn.trigger){
			dom.document.location.href = "/top";
			return false;
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
		// ウインドウサイズに対する位置調整
		for(var name in this._btnList){
			var btn = this._btnList[name];
			if(btn.basex < 0){btn.x = Ctrl.screen.w + btn.basex;}
			if(btn.basey < 0){btn.y = Ctrl.screen.h + btn.basey;}
		}

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.screen.w, Ctrl.screen.h);

		// 仮マイページキャラ顔の位置
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(0, 120 + 40 * ((Ctrl.screen.h / 240) - 1), Ctrl.screen.w, 2);
		Ctrl.sctx.fillRect(Ctrl.screen.w * 0.5, 0, 2, Ctrl.screen.h);

		// 仮バナースペース
		Ctrl.sctx.fillStyle = "#ffffff";
		Ctrl.sctx.fillRect((Ctrl.screen.w - 320) * 0.5, Ctrl.screen.h - 50, 320, 50);

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

