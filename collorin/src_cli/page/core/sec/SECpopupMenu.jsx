import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";

import "../Page.jsx";
import "../parts/PartsLabel.jsx";
import "../parts/PartsButton.jsx";
import "SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップ
class SECpopupMenu extends SECpopup{
	var _page : Page;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _menuList = {} : Map.<PartsButton>;
	var _px : int;
	var _pw : int;
	var _ph : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge){
		super(cartridge);
		this._page = page;
		this._px = 45;
		this._pw = 230;
		this._ph = 220;

		// ラベル作成
		this._labList["title"] = new PartsLabel("メニュー", this._px, 0, this._pw, 40);

		// ボタン作成
		var x0 = this._px + 10;
		var x1 = this._px + this._pw - 100 - 10;
		this._menuList["world"] = new PartsButtonBasic("ワールド", x0, 40 + 35 * 0, 100, 30);
		this._menuList["quest"] = new PartsButtonBasic("クエスト", x1, 40 + 35 * 0, 100, 30);
		this._menuList["chara"] = new PartsButtonBasic("キャラクタ", x0, 40 + 35 * 1, 100, 30);
		this._menuList["item"] = new PartsButtonBasic("アイテム", x1, 40 + 35 * 1, 100, 30);
		this._menuList["friend"] = new PartsButtonBasic("友達", x0, 40 + 35 * 2, 100, 30);
		this._menuList["refbook"] = new PartsButtonBasic("図鑑", x1, 40 + 35 * 2, 100, 30);
		this._menuList["setting"] = new PartsButtonBasic("設定", x0, 40 + 35 * 3, 100, 30);
		this._menuList["help"] = new PartsButtonBasic("ヘルプ", x1, 40 + 35 * 3, 100, 30);
		this._btnList["outer"] = new PartsButton(this._px, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._px + (this._pw - 100) * 0.5, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;

		this._menuList["quest"].inactive = true;
		this._menuList["item"].inactive = true;
		this._menuList["friend"].inactive = true;
		this._menuList["refbook"].inactive = true;
		this._menuList["help"].inactive = true;

		var current = this._menuList[Page.current.type];
		if(current != null){current.select = true;}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		for(var name in this._menuList){this._menuList[name].trigger = false;}
		// コントローラとじてる
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		// ヘッダ無効化
		this._page.header.setActive(false);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}
		for(var name in this._menuList){this._menuList[name].calc(true);}

		// メニューボタン押下処理
		for(var name in this._menuList){
			var btn = this._menuList[name];
			if(btn.trigger){
				if(!btn.select){
					Sound.playSE("ok");
					Page.transitionsPage(name);
					return true;
				}else{
					Sound.playSE("ng");
					this._page.serialPush(this.parentCartridge);
					return false;
				}
			}
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
		for(var name in this._menuList){this._menuList[name].y = this._menuList[name].basey + py;}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], this._px, py, this._pw, this._ph);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}
		for(var name in this._menuList){this._menuList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

