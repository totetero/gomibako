import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/EventCartridge.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopup.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "SECdicePopupMenuSetting.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップイベントカートリッジ
class SECdicePopupMenu extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="title">メニュー</div>
			<div class="info">クエスト情報とかものせる</div>
			<div class="core-btn setting">設定</div>
			<div class="core-btn back">退出</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : DicePage;
	var _cartridge : EventCartridge;
	var _camera : int;
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, camera : int){
		this._page = page;
		this._cartridge = cartridge;
		this._camera = camera;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup dice menu";
		this.popupDiv.innerHTML = SECdicePopupMenu._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["setting"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn setting").item(0) as HTMLDivElement, true);
		this._btnList["back"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn back").item(0) as HTMLDivElement, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["close"].sKey = true;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			ccvs.calc(false, this._camera, null, null);

			// ボタン計算
			for(var name in this._btnList){this._btnList[name].calc(true);}

			// 設定ボタン
			if(this._btnList["setting"].trigger){
				this._btnList["setting"].trigger = false;
				if(active){
					Sound.playSE("ok");
					this._page.serialPush(new SECdicePopupMenuSetting(this._page, this._cartridge, this._camera));
					exist = false;
				}
			}

			// 中断ボタン
			if(this._btnList["back"].trigger){
				this._btnList["back"].trigger = false;
				if(active){
					Sound.playSE("ng");
					Page.transitionsPage("world");
				}
			}

			// 閉じるボタン
			if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
				this._btnList["close"].trigger = false;
				this._btnList["outer"].trigger = false;
				if(active){
					Sound.playSE("ng");
					this._page.serialPush(this._cartridge);
					exist = false;
				}
			}
		}

		// キャンバス描画
		return ccvs.draw(exist);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

