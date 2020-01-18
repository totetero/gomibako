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
import "../../popup/SECpopupPicker.jsx";
import "DataChara.jsx";
import "PartsButtonDataChara.jsx";
import "SECpopupDataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクターピッカーポップアップ
abstract class SECpopupDataCharaPicker extends SECpopup{
	var page : Page;
	var _charaList : PartsButtonDataChara[];
	var _sortPicker : SECpopupPicker;
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;

	var _maxCharaNum : int;
	var _prevSortTag : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SerialEventCartridge, title : string, charaList : PartsButtonDataChara[], sortPicker : SECpopupPicker, maxCharaNum : int, isRemovable : boolean, scrolly : int){
		super(cartridge);
		this.page = page;
		this._charaList = charaList;
		this._sortPicker = sortPicker;
		this._sortPicker.parentCartridge = this;
		this._maxCharaNum = maxCharaNum;

		// スクローラ作成
		this._scroller = new PartsScroll(0, 0, 0, 0, 0, 0);
		this._scroller.btnList = {} : Map.<PartsButton>;
		for(var i = 0; i < this._charaList.length; i++){
			this._scroller.btnList["item" + i] = this._charaList[i];
			this._scroller.btnList["icon" + i] = this._charaList[i].iconBtn;
		}
		this._scroller.scrolly = scrolly;

		// ソート
		var sortTag = this._sortPicker.getSelectedItem().tag;
		this._prevSortTag = sortTag;
		PartsButtonDataChara.sort(this._charaList, sortTag);

		// ラベル作成
		this._labList["title"] = new PartsLabel(title, 0, 0, 0, 30);
		this._labList["max"] = new PartsLabel("", 0, 0, 90, 20);
		this._labList["max"].setSize(14);
		this._labList["max"].setAlign("right");

		// ボタン作成
		this._btnList["picker"] = this._sortPicker.createButton(0, 0, 135);
		if(isRemovable){this._btnList["remove"] = new PartsButtonBasic("はずす", 0, 0, 80, 30);}
		this._btnList["outer"] = new PartsButton(0, 0, 0, 0, false);
		this._btnList["close"] = new PartsButtonBasic("とじる", 0, 0, 80, 30);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// クロス設定
		this.page.ctrler.setLctrl(false);
		this.page.ctrler.setRctrl("", "", "", "");
		this.page.header.setActive(false);
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}

		// ソート
		var sortTag = this._sortPicker.getSelectedItem().tag;
		if(this._prevSortTag != sortTag){
			this._prevSortTag = sortTag;
			PartsButtonDataChara.sort(this._charaList, sortTag);
			this._scroller.scrolly = 0;
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// ピッカーボタン押下処理
		if(this._btnList["picker"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(this._sortPicker);
			this.close = false;
			return false;
		}

		for(var i = 0; i < this._charaList.length; i++){
			var chara = this._charaList[i];

			// 要素選択
			if(chara.trigger){
				Sound.playSE("ok");
				this.onSelect(chara.data.id);
				this.onClose(this._scroller.scrolly);
				this.page.serialPush(this.parentCartridge);
				return false;
			}

			// キャラクタ情報ポップアップ
			if(chara.iconBtn.trigger){
				Sound.playSE("ok");
				this.page.serialPush(new SECpopupDataChara(this.page, this, chara.data));
				this.close = false;
				return false;
			}
		}

		// はずすボタン押下処理
		var btn = this._btnList["remove"];
		if(btn != null && btn.trigger){
			Sound.playSE("ok");
			this.onSelect("");
			this.onClose(this._scroller.scrolly);
			this.page.serialPush(this.parentCartridge);
			return false;
		}

		// とじるボタン押下処理
		if(this._btnList["outer"].trigger || this._btnList["close"].trigger){
			Sound.playSE("ng");
			this.onClose(this._scroller.scrolly);
			this.page.serialPush(this.parentCartridge);
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
		var mLab = this._labList["max"];
		var pBtn = this._btnList["picker"];
		var oBtn = this._btnList["outer"];
		var rBtn = this._btnList["remove"];
		var cBtn = this._btnList["close"];
		var pArea = 48;
		var cArea = 40;
		// 縦横の要素数計算
		var itemw = this._charaList[0].w;
		var itemh = this._charaList[0].h;
		var maxcw = Ctrl.screen.w - 20 - 6;
		var rowNum = Math.min(Math.floor((maxcw + 5) / (itemw + 5)), this._charaList.length);
		var colNum = Math.ceil(this._charaList.length / rowNum);
		// 各要素の位置調整
		this._scroller.sh = colNum * (itemh + 5) - 5;
		var pw = oBtn.w = ((rowNum > 1) ? rowNum * (itemw + 5) - 5 : itemw + 66) + 6;
		var ph = oBtn.h = Math.min(Ctrl.screen.h - 20, this._scroller.sh + (3 + tLab.h + 2) + (pArea + 2) + (3 + cArea + 2));
		var px = oBtn.x = Math.floor((Ctrl.screen.w - pw) * 0.5);
		var py = oBtn.y = Math.floor((Ctrl.screen.h - ph) * 0.5);
		tLab.x = px;
		tLab.y = py + 3;
		tLab.w = pw;
		mLab.x = px + pw - 3 - mLab.w - 5;
		mLab.y = py + (3 + tLab.h + 2) + pArea - mLab.h - 5;
		pBtn.x = px + 10;
		pBtn.y = py + (3 + tLab.h + 2) + (pArea - pBtn.h) * 0.5;
		cBtn.y = py + ph - 3 - (cArea + cBtn.h) * 0.5;
		if(rBtn != null){
			var cw = (pw - rBtn.w - cBtn.w) / 3;
			rBtn.y = cBtn.y;
			rBtn.x = px + cw;
			cBtn.x = rBtn.x + rBtn.w + cw;
		}else{
			cBtn.x = px + (pw - cBtn.w) * 0.5;
		}
		this._scroller.x = px + 3;
		this._scroller.y = py + (3 + tLab.h + 2) + (pArea + 2);
		this._scroller.cw = pw - 6;
		this._scroller.ch = ph - (3 + tLab.h + 2) - (pArea + 2) - (3 + cArea + 2);
		for(var i = 0; i < this._charaList.length; i++){
			this._charaList[i].basex = (rowNum > 1) ? (itemw + 5) * (i % rowNum) : 33;
			this._charaList[i].basey = (itemh + 5) * Math.floor(i / rowNum);
		}

		// 枠描画
		Drawer.drawBox(Ctrl.sctx, Loader.imgs["img_system_box_basic"], px, py, pw, ph);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h), pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + (3 + tLab.h + 2) + pArea, pw - 6, 2);
		Ctrl.sctx.fillRect(px + 3, py + ph - (3 + cArea) - 2, pw - 6, 2);

		// ラベル描画
		if(this._maxCharaNum > 0){mLab.setText(this._charaList.length + "/" + this._maxCharaNum);}
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{});
	}

	// ----------------------------------------------------------------
	// 選択時の動作 継承用
	abstract function onSelect(id : string) : void;

	// ----------------------------------------------------------------
	// 閉じるときの動作 継承用
	function onClose(scrolly : int) : void{}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

