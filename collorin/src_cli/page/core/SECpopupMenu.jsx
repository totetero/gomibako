import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "Page.jsx";
import "PartsLabel.jsx";
import "PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップ
class SECpopupMenu extends SECpopup{
	var _page : Page;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _pw : int;
	var _ph : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;
		this._pw = 300;
		this._ph = 220;

		// ラベル作成
		this._labList["title"] = new PartsLabel("メニュー", 0, 0, this._pw, 40);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._pw - 100 - 10, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;
		this._btnList["mypage"] = new PartsButtonBasic("マイページ", 10, 40, 100, 30);
		this._btnList["test"] = new PartsButtonBasic("テスト", 10, 80, 100, 30);
		this._btnList["setting"] = new PartsButtonBasic("設定", 10, 120, 100, 30);

		var current = this._btnList[Page.current.type];
		if(current != null){current.select = current.inactive = true;}
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

		// ボタン押下処理
		var list = ["mypage", "test", "setting"];
		for(var i = 0; i < list.length; i++){
			var btn = this._btnList[list[i]];
			if(btn.trigger){
				btn.trigger = false;
				Sound.playSE("ok");
				Page.transitionsPage(list[i]);
				this._page.serialPush(this.parentCartridge);
				this.close = true;
				return false;
			}
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
		for(var name in this._labList){
			var lab = this._labList[name];
			lab.x = lab.basex + px;
			lab.y = lab.basey + py;
		}
		for(var name in this._btnList){
			var btn = this._btnList[name];
			btn.x = btn.basex + px;
			btn.y = btn.basey + py;
		}

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

