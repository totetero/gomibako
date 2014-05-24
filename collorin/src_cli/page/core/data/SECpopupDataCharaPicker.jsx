import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

import "../popup/SECpopup.jsx";
import "DataChara.jsx";
import "PartsButtonDataChara.jsx";
import "SECpopupDataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ピッカーポップアップ
class SECpopupDataCharaPicker extends SECpopup{
	var _page : Page;
	var _charaList : PartsButtonDataChara[];
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, charaList : PartsButtonDataChara[]){
		super(cartridge);
		this._page = page;
		this._charaList = charaList;

		// スクローラ作成
		this._scroller = new PartsScroll(0, 0, 0, 0, 0, 0);
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._charaList.length; i++){
			this._scroller.btnList["item" + i] = this._charaList[i];
			this._scroller.btnList["face" + i] = this._charaList[i].faceBtn;
		}

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 0, 0, 0, 30);

		// ボタン作成
		this._btnList["outer"] = new PartsButton(0, 0, 0, 0, false);
		this._btnList["close"] = new PartsButtonBasic("閉じる", 0, 0, 80, 30);
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
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		for(var i = 0; i < this._charaList.length; i++){
			var chara = this._charaList[i];

			// 要素選択
			if(chara.trigger){
				Sound.playSE("ok");
				this.onSelect(chara.data.id);
				this._page.serialPush(this.parentCartridge);
				return false;
			}

			// キャラクタ情報ポップアップ
			if(chara.faceBtn.trigger){
				Sound.playSE("ok");
				this._page.serialPush(new SECpopupDataChara(this._page, this, chara.data));
				this.close = false;
				return false;
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
		var tLab = this._labList["title"];
		//var pBtn = this._btnList["picker"];
		var oBtn = this._btnList["outer"];
		var cBtn = this._btnList["close"];
		var pArea = 42;
		var cArea = 48;
		// 縦横の要素数計算
		var itemw = this._charaList[0].w;
		var itemh = this._charaList[0].h;
		var maxcw = Ctrl.screen.w - 20 - 6;
		var rowNum = Math.min(Math.floor((maxcw + 5) / (itemw + 5)), this._charaList.length);
		var colNum = Math.ceil(this._charaList.length / rowNum);
		// 各要素の位置調整
		var diff = itemh * 0.3;
		this._scroller.sh = colNum * (itemh + 5) + ((this._charaList.length - 1) % rowNum) * diff - 5;
		var pw = oBtn.w = rowNum * (itemw + 5) - 5 + 6;
		var ph = oBtn.h = Math.min(Ctrl.screen.h - 20, this._scroller.sh + (3 + tLab.h + 2) + (2 + pArea + 2) + (3 + cArea + 2));
		var px = oBtn.x = Math.floor((Ctrl.screen.w - pw) * 0.5);
		var py = oBtn.y = Math.floor((Ctrl.screen.h - ph) * 0.5);
		tLab.x = px;
		tLab.y = py + 3;
		tLab.w = pw;
		cBtn.x = px + (pw - cBtn.w) * 0.5;
		cBtn.y = py + ph - 3 - (cArea + cBtn.h) * 0.5;
		this._scroller.x = px + 3;
		this._scroller.y = py + (3 + tLab.h + 2) + (2 + pArea + 2);
		this._scroller.cw = pw - 6;
		this._scroller.ch = ph - (3 + tLab.h + 2) - (2 + pArea + 2) - (3 + cArea + 2);
		for(var i = 0; i < this._charaList.length; i++){
			this._charaList[i].basex = (itemw + 5) * (i % rowNum);
			this._charaList[i].basey = (itemh + 5) * Math.floor(i / rowNum) + (i % rowNum) * diff;
		}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, pw, ph);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h), pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h + 2) + (2 + pArea), pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + ph - (3 + cArea) - 2, pw - 6, 2);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{});
	}

	// ----------------------------------------------------------------
	// 選択時の動作 継承用
	function onSelect(id : string) : void{}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

