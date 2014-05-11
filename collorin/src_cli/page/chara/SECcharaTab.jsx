import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopupMenu.jsx";

import "PageChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// テストイベントカートリッジ
abstract class SECcharaTab implements SerialEventCartridge{
	var page : PageChara;
	var _tabList = {} : Map.<PartsButton>;

	abstract function tabCalc() : boolean;
	abstract function tabDraw() : void;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, type : string){
		this.page = page;

		// ボタン作成
		this._tabList["team"] = new PartsButtonTabLeft("編成",  0, 0, 50, 40);
		this._tabList["supp"] = new PartsButtonTabLeft("補給",  0, 0, 50, 40);
		this._tabList["rest"] = new PartsButtonTabLeft("休息",  0, 0, 50, 40);
		this._tabList["pwup"] = new PartsButtonTabLeft("強化",  0, 0, 50, 40);
		this._tabList["sell"] = new PartsButtonTabLeft("別れ",  0, 0, 50, 40);
		this._tabList[type].select = true;
		this._tabList[type].inactive = true;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// コントローラとじてる
		this.page.ctrler.setLctrl(false);
		this.page.ctrler.setRctrl("", "", "", "");
		// ヘッダ有効化
		this.page.header.setActive(true);
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._tabList){this._tabList[name].calc(true);}

		// 左ヘッダ戻るボタン押下処理
		if(this.page.header.lbtn.trigger){
			this.page.header.lbtn.trigger = false;
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this.page.header.rbtn.trigger){
			this.page.header.rbtn.trigger = false;
			Sound.playSE("ok");
			this.page.serialPush(new SECpopupMenu(this.page, this));
			return false;
		}

		return this.tabCalc();
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		var h = Math.floor((Ctrl.sh - 60) / 5);
		this._tabList["team"].y = 55 + h * 0;
		this._tabList["supp"].y = 55 + h * 1;
		this._tabList["rest"].y = 55 + h * 2;
		this._tabList["pwup"].y = 55 + h * 3;
		this._tabList["sell"].y = 55 + h * 4;
		this._tabList["team"].h = h;
        this._tabList["supp"].h = h;
        this._tabList["rest"].h = h;
        this._tabList["pwup"].h = h;
        this._tabList["sell"].h = h;

		// 画面クリア
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(0, 0, 48, Ctrl.sh);
		Ctrl.sctx.fillStyle = "#000000";
		Ctrl.sctx.fillRect(48, 0, 2, Ctrl.sh);
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(50, 0, Ctrl.sw - 50, Ctrl.sh);

		// ボタン描画
		for(var name in this._tabList){this._tabList[name].draw();}

		// タブの中身描画
		this.tabDraw();

		// ヘッダ描画
		this.page.header.draw();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

