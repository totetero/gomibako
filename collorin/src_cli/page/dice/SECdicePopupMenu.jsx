import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/parts/PartsLabel.jsx";
import "../core/parts/PartsButton.jsx";
import "../core/sec/SECpopup.jsx";

import "PageDice.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくメニューポップアップ
class SECdicePopupMenu extends SECpopup{
	var _page : PageDice;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _px : int;
	var _pw : int;
	var _ph : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;
		this._px = 10;
		this._pw = 300;
		this._ph = 220;

		// ラベル作成
		this._labList["name"] = new PartsLabel("メニュー", this._px, 10, this._pw, 30);

		// ボタン作成
		this._btnList["back"] = new PartsButtonBasic("戻る", this._px + 10, 40, 100, 30);
		this._btnList["outer"] = new PartsButton(this._px, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._px + this._pw - 100 - 10, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.cameraLock = true;
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		// コントローラ表示
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 中断ボタン
		if(this._btnList["back"].trigger){
			Sound.playSE("ng");
			Page.transitionsPage("world");
			return true;
		}

		// 閉じるボタン押下処理
		if(this._btnList["outer"].trigger || this._btnList["close"].trigger){
			Sound.playSE("ng");
			this._page.serialPush(this.parentCartridge);
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var py = (Ctrl.sh - this._ph) * 0.5;
		for(var name in this._labList){this._labList[name].y = this._labList[name].basey + py;}
		for(var name in this._btnList){this._btnList[name].y = this._btnList[name].basey + py;}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], this._px, py, this._pw, this._ph);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

