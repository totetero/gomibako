import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/PartsButton.jsx";
import "../core/SECpopup.jsx";

import "PageTest.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストイベントカートリッジ
class SECtestPopupTest extends SECpopup{
	var _page : PageTest;
	var _btnList = {} : Map.<PartsButton>;
	var _pw : int;
	var _ph : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageTest, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;
		this._pw = (Math.random() > 0.5) ? 300 : 150;
		this._ph = (Math.random() > 0.5) ? 220 : 110;

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._pw - 100 - 10, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;
		this._btnList["test"] = new PartsButtonBasic("テスト", 10, 10, 100, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ヘッダ無効化
		this._page.header.setActive(false);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// テストボタン押下処理
		var btn = this._btnList["test"];
		if(btn.trigger){
			btn.trigger = false;
			Sound.playSE("ok");
			this._page.serialPush(new SECtestPopupTest(this._page, this));
			this.close = false;
			return false;
		}

		// 閉じるボタン押下処理
		var btn0 = this._btnList["outer"];
		var btn1 = this._btnList["close"];
		if(btn0.trigger || btn1.trigger){
			btn0.trigger = false;
			btn1.trigger = false;
			Sound.playSE("ng");
			this._page.serialPush(this.parentCartridge);
			this.close = true;
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function popupDraw() : void{
		// 親カートリッジ描画後に上書き

		// ウインドウサイズに対する位置調整
		var px = (Ctrl.sw - this._pw) * 0.5;
		var py = (Ctrl.sh - this._ph) * 0.5;
		for(var name in this._btnList){
			var btn = this._btnList[name];
			btn.x = btn.basex + px;
			btn.y = btn.basey + py;
		}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, this._pw, this._ph);

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

