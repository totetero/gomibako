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

import "../core/data/chara/PartsButtonDataChara.jsx";
import "../core/data/chara/SECpopupDataChara.jsx";
import "../core/popup/SECpopupPicker.jsx";
import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター補給タブカートリッジ
class SECcharaTabSupp extends SECcharaTab{
	var _labList = {} : Map.<PartsLabel>;
	var _btnList = {} : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var _charaList : PartsButtonDataChara[];
	var _sortPicker : SECpopupPicker;

	var _maxCharaNum : int;
	var _prevSortTag : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, response : variant){
		super(page, "supp");

		// スクローラ作成
		this._scroller = new PartsScroll(SECcharaTab.tabWidth, 122, 0, 0, 0, 0);

		// ラベル作成
		this._labList["max"] = new PartsLabel("", 0, 95, 90, 20);
		this._labList["max"].setSize(14);
		this._labList["max"].setAlign("right");

		// ピッカー作成
		this._sortPicker = new SECpopupPicker(this.page, this, "並べ替え", [
			new SECpopupPickerItem("sp", "SP消費順"),
			new SECpopupPickerItem("level", "レベル順"),
			new SECpopupPickerItem("team", "チーム順"),
			new SECpopupPickerItem("favorite", "ファボ順"),
			new SECpopupPickerItem("type", "種類順"),
			new SECpopupPickerItem("new", "新着順"),
		]);
		this._sortPicker.setSelectedItem("sp");

		// ボタン作成
		this._btnList["picker"] = this._sortPicker.createButton(this._scroller.x + 10, this._scroller.y - 45, 135);
		this._btnList["supp"] = new PartsButtonBasic("補給", 0, 60, 100, 30);

		// データ形成
		this._parse(response);
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function _parse(response : variant) : void{
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		this._charaList = new PartsButtonDataChara[];
		for(var i = 0; i < list.length; i++){
			var chara = new PartsButtonDataChara(0, 0, list[i]);
			//chara.inactive = (i == 0); // TODO 補給不能状態(出撃中 or SPMAX or 使い捨てキャラ?)
			this._charaList.push(chara);
		}
		this._maxCharaNum = response["max"] as int;

		// スクローラボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		this._scroller.btnList["all"] = new PartsButtonBasic("", 0, 5, 100, 30);
		for(var i = 0; i < this._charaList.length; i++){
			this._scroller.btnList["box" + i] = this._charaList[i];
			this._scroller.btnList["icon" + i] = this._charaList[i].iconBtn;
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		super.init();
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}

		// ソート
		var sortTag = this._sortPicker.getSelectedItem().tag;
		if(this._prevSortTag != sortTag){
			this._prevSortTag = sortTag;
			PartsButtonDataChara.sort(this._charaList, sortTag);
			// 初期スクロール設定
			this._scroller.sh = Math.max(this._scroller.ch + 40, this._scroller.sh);
			this._scroller.scrolly = -40;
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function tabCalc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// キャラクターリストボタン
		var count = 0;
		var isAll = true;
		for(var i = 0; i < this._charaList.length; i++){
			var chara = this._charaList[i];

			// キャラクタ選択ボタン処理
			if(chara.trigger){
				Sound.playSE(chara.select ? "ng" : "ok");
				chara.trigger = false;
				chara.select = !chara.select;
			}

			// キャラクタ情報ポップアップ
			if(chara.iconBtn.trigger){
				Sound.playSE("ok");
				this.page.serialPush(new SECpopupDataChara(this.page, this, chara.data));
				return false;
			}

			if(chara.select){count++;}
			else if(!chara.inactive){isAll = false;}
		}

		// ピッカーボタン
		if(this._btnList["picker"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(this._sortPicker);
			return false;
		}

		// 補給ボタン
		var btn = this._btnList["supp"];
		btn.inactive = !(count > 0);
		if(btn.trigger){
			// TODO ポップアップ作成
		}

		// 全選択ボタン
		var btn = this._scroller.btnList["all"];
		if(btn.trigger){
			Sound.playSE(isAll ? "ng" : "ok");
			btn.trigger = false;
			for(var i = 0; i < this._charaList.length; i++){
				var chara = this._charaList[i];
				if(!chara.inactive){chara.select = !isAll;}
			}
			isAll = !isAll;
		}
		(btn as PartsButtonBasic).label.setText(isAll ? "全選択解除" : "全選択");

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function tabDraw() : void{
		// ウインドウサイズに対する位置調整
		var mLab = this._labList["max"];
		var sBtn = this._btnList["supp"];
		var aBtn = this._scroller.btnList["all"];
		mLab.x = Ctrl.screen.w - mLab.w - 10;
		sBtn.x = Ctrl.screen.w - sBtn.w - 5;
		this._scroller.cw = Ctrl.screen.w - this._scroller.x;
		this._scroller.ch = Ctrl.screen.h - this._scroller.y;
		aBtn.basex = (this._scroller.cw - aBtn.w) * 0.5;
		var itemw = this._charaList[0].w;
		var itemh = this._charaList[0].h;
		var rowNum = Math.min(Math.floor((this._scroller.cw - 20 + 5) / (itemw + 5)), this._charaList.length);
		var colNum = Math.ceil(this._charaList.length / rowNum);
		this._scroller.sh = 40 + Math.max(this._scroller.ch, colNum * (itemh + 5) - 5);
		// キャラクター位置調整
		var cx = (this._scroller.cw - ((itemw + 5) * rowNum - 5)) * 0.5;
		for(var i = 0; i < this._charaList.length; i++){
			this._charaList[i].basex = cx + (itemw + 5) * (i % rowNum);
			this._charaList[i].basey = 40 + (itemh + 5) * Math.floor(i / rowNum);
		}

		// 枠描画
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(this._scroller.x + 10, this._scroller.y - 2, this._scroller.cw - 20, 2);

		// ラベル描画
		if(this._maxCharaNum > 0){mLab.setText(this._charaList.length + "/" + this._maxCharaNum);}
		for(var name in this._labList){this._labList[name].draw();}

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// スクローラー描画
		this._scroller.draw(function() : void{});
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

