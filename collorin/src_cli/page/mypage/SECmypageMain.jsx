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
	function constructor(page : PageMypage){
		this._page = page;

		// ボタン作成
		this._btnList["world"] = new PartsButtonBasic("ワールド",  10, 400, 100, 30);
		this._btnList["quest"] = new PartsButtonBasic("クエスト",  10, 440, 100, 30);
		this._btnList["chara"] = new PartsButtonBasic("キャラクタ", 210, 400, 100, 30);
		this._btnList["item"] = new PartsButtonBasic("アイテム", 210, 440, 100, 30);

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
			btn.x = btn.basex + (Ctrl.sw - 320);
			btn.y = btn.basey + (Ctrl.sh - 480) - 50;
		}

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);

		// 仮マイページキャラ顔の位置
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(0, 120 + 40 * ((Ctrl.sh / 240) - 1), 320, 2);
		Ctrl.sctx.fillRect(160, 0, 2, Ctrl.sh);

		// 仮バナースペース
		Ctrl.sctx.fillStyle = "#ffffff";
		Ctrl.sctx.fillRect(0, Ctrl.sh - 50, Ctrl.sw, 50);

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

