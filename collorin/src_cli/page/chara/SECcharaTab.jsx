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

import "../core/load/SECload.jsx";
import "../core/popup/SECpopupMenu.jsx";
import "PageChara.jsx";
import "SECcharaTabTeam.jsx";
import "SECcharaTabSupp.jsx";
import "SECcharaTabRest.jsx";
import "SECcharaTabPwup.jsx";
import "SECcharaTabSell.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタータブひな形カートリッジ
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
		// クロス設定
		this.page.ctrler.setLctrl(false);
		this.page.ctrler.setRctrl("", "", "", "");
		this.page.header.setActive(true);
		// トリガーリセット
		for(var name in this._tabList){this._tabList[name].trigger = false;}
		this.page.header.lbtn.trigger = false;
		this.page.header.rbtn.trigger = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		for(var name in this._tabList){this._tabList[name].calc(true);}

		// 編成タブ
		if(this._tabList["team"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECload(this, "/chara/team", null, function(response : variant) : void{
				this.page.serialPush(new SECcharaTabTeam(this.page, response));
			}));
			return false;
		}

		// 補給タブ
		if(this._tabList["supp"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECload(this, "/chara/supp", null, function(response : variant) : void{
				this.page.serialPush(new SECcharaTabSupp(this.page, response));
			}));
			return false;
		}

		// 休息タブ
		if(this._tabList["rest"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECload(this, "/chara/rest", null, function(response : variant) : void{
				this.page.serialPush(new SECcharaTabRest(this.page, response));
			}));
			return false;
		}

		// 強化タブ
		if(this._tabList["pwup"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECload(this, "/chara/pwup", null, function(response : variant) : void{
				this.page.serialPush(new SECcharaTabPwup(this.page, response));
			}));
			return false;
		}

		// 売却タブ
		if(this._tabList["sell"].trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECload(this, "/chara/sell", null, function(response : variant) : void{
				this.page.serialPush(new SECcharaTabSell(this.page, response));
			}));
			return false;
		}

		// 左ヘッダ戻るボタン押下処理
		if(this.page.header.lbtn.trigger){
			Sound.playSE("ng");
			Page.transitionsPage("mypage");
			return true;
		}

		// 右ヘッダメニューボタン押下処理
		if(this.page.header.rbtn.trigger){
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
		var h = Math.floor((Ctrl.screen.h - 60) / 5);
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
		Ctrl.sctx.fillRect(0, 0, 48, Ctrl.screen.h);
		Ctrl.sctx.fillStyle = "#000000";
		Ctrl.sctx.fillRect(48, 0, 2, Ctrl.screen.h);
		Ctrl.sctx.fillStyle = "#cccccc";
		Ctrl.sctx.fillRect(50, 0, Ctrl.screen.w - 50, Ctrl.screen.h);

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

