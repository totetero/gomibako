import "js/web.jsx";

import "../../../../util/Ctrl.jsx";
import "../../../../util/Sound.jsx";
import "../../../../util/Drawer.jsx";
import "../../../../util/Loader.jsx";
import "../../../../util/Loading.jsx";
import "../../../../util/EventCartridge.jsx";
import "../../../../util/PartsLabel.jsx";
import "../../../../util/PartsButton.jsx";
import "../../../../util/PartsScroll.jsx";
import "../../Page.jsx";

import "../../popup/SECpopup.jsx";
import "DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報表示ポップアップ
class SECpopupDataChara extends SECpopup{
	var _page : Page;
	var _data : DataChara;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _pw = 300;
	var _ph = 220;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, data : DataChara){
		super(cartridge);
		this._page = page;
		this._data = data;

		// ラベル作成
		this._labList["name"] = new PartsLabel(this._data.name, 150, 10, this._pw - 160, 30);
		this._labList["name"].setAlign("left");

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._pw - 100 - 10, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");
		this._page.header.setActive(false);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

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
		// タイプ識別リボン
		Ctrl.sctx.fillStyle = "blue";
		Ctrl.sctx.beginPath();
		var x1 = px + 3;
		var x2 = px + 30;
		var y1 = py + 3;
		var y2 = py + this._ph - 3;
		Ctrl.sctx.moveTo(x2, y1);
		Ctrl.sctx.arcTo(x1, y1, x1, y2, 7);
		Ctrl.sctx.arcTo(x1, y2, x2, y2, 7);
		Ctrl.sctx.lineTo(x2, y2);
		Ctrl.sctx.closePath();
		Ctrl.sctx.fill();

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// キャラクター描画
		Ctrl.sctx.drawImage(Loader.imgs["img_chara_bust_" + this._data.code], 60, 70, 200, 400, px + 40, py + 10, 100, 200);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

