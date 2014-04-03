import "js/web.jsx";

import "../../util/Sound.jsx";
import "../../util/EventCartridge.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopup.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューポップアップイベントカートリッジ
class SECdicePopupSkill extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="window">
			<div class="title">スキル</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : DicePage;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge){
		this._page = page;
		this._cartridge = cartridge;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup dice skill";
		this.popupDiv.innerHTML = SECdicePopupSkill._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("window").item(0) as HTMLDivElement;

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(false, 0, null, null);

		// ボタン計算
		for(var name in this._btnList){this._btnList[name].calc(true);}

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

		// キャンバス描画
		ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

