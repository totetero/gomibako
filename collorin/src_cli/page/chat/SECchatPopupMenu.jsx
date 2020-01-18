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

import "../core/popup/SECpopup.jsx";
import "../setting/SECsettingPopupLocal.jsx";
import "PageChat.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットメニューポップアップ
class SECchatPopupMenu extends SECpopup{
	var _page : PageChat;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _pw = 120;
	var _ph = 160;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChat, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;

		// ラベル作成
		this._labList["title"] = new PartsLabel("メニュー", 0, 0, this._pw, 40);

		// ボタン作成
		this._btnList["setting"] = new PartsButtonBasic("設定", (this._pw - 100) * 0.5, 40, 100, 30);
		this._btnList["back"] = new PartsButtonBasic("退出", (this._pw - 100) * 0.5, 80, 100, 30);
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", (this._pw - 80) * 0.5, this._ph - 30 - 10, 80, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.cameraLock = true;
		// クロス設定
		this._page.bust.set(null);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// 設定ボタン
		if(this._btnList["setting"].trigger){
			Sound.playSE("ok");
			this._page.bcvs.cameraLock = true;
			this._page.serialPush(new SECdiceSettingPopupLocal(this._page, this.parentCartridge));
			return false;
		}

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
		var px = (Ctrl.screen.w - this._pw) * 0.5;
		var py = (Ctrl.screen.h - this._ph) * 0.5;
		for(var name in this._labList){var lab = this._labList[name]; lab.x = lab.basex + px; lab.y = lab.basey + py;}
		for(var name in this._btnList){var btn = this._btnList[name]; btn.x = btn.basex + px; btn.y = btn.basey + py;}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, this._pw, this._ph);

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

// ローカルで完結する設定ポップアップ 閉じるときにキャンバス設定を行う
class SECdiceSettingPopupLocal extends SECsettingPopupLocal{
	var _pageChat : PageChat;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChat, cartridge : SerialEventCartridge){
		super(page, cartridge);
		this._pageChat = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		super.init();
		this._pageChat.bcvs.setting();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

