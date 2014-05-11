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
import "../sec/SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報
class DataChara{
	var id : string;
	var code : string;
	var name : string;
	var level : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		this.id = response["id"] as string;
		this.code = response["code"] as string;
		this.name = response["name"] as string;
		this.level = response["level"] as int;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報表示
class DataCharaBox extends DataChara{
	var boxBtn : PartsButton;
	var faceBtn : PartsButton;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, response : variant){
		super(response);
		this.boxBtn = new PartsButton(x, y, 180, 60, true);
		this.faceBtn = new PartsButton(x + 5, y + 5, 50, 50, true);
		this.boxBtn.children = [this.faceBtn as PartsButton];
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 領域全体の描画
		Ctrl.sctx.fillStyle = this.boxBtn.active ? "rgb(128,128,128)" : "rgb(255,255,255)";
		Ctrl.sctx.fillRect(this.boxBtn.x, this.boxBtn.y, this.boxBtn.w, this.boxBtn.h);
		// 顔アイコンの描画
		Ctrl.sctx.fillStyle = this.faceBtn.active ? "rgb(255,0,0)" : "rgb(255,128,128)";
		Ctrl.sctx.fillRect(this.faceBtn.x, this.faceBtn.y, this.faceBtn.w, this.faceBtn.h);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報表示ポップアップ
class SECpopupDataChara extends SECpopup{
	var _page : Page;
	var _data : DataChara;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _px : int;
	var _pw : int;
	var _ph : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, data : DataChara){
		super(cartridge);
		this._page = page;
		this._data = data;
		this._px = 10;
		this._pw = 300;
		this._ph = 220;

		// ラベル作成
		this._labList["title"] = new PartsLabel("テスト", this._px, 0, this._pw, 40);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(this._px, 0, this._pw, this._ph, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", this._px + this._pw - 100 - 10, this._ph - 30 - 10, 100, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
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

		// 閉じるボタン押下処理
		var btn0 = this._btnList["outer"];
		var btn1 = this._btnList["close"];
		if(btn0.trigger || btn1.trigger){
			btn0.trigger = false;
			btn1.trigger = false;
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

