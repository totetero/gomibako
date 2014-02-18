import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/Popup.jsx";

import "ChatPage.jsx";
import "ChatCanvas.jsx";
import "SECchatMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページポップアップイベントカートリッジ
class SECchatCharacterPopup extends SECpopup{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="sidebar"></div>
			<div class="name"></div>
			<div class="chara"></div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : ChatPage;
	var _chara : ChatCharacter;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, chara : ChatCharacter){
		this._page = page;
		this._chara = chara;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popup = this._page.div.getElementsByClassName("core-popup").item(0) as HTMLDivElement;
		this.popup.innerHTML = this._htmlTag;
		this.window = this.popup.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this.window.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._chara.name;
		(this.window.getElementsByClassName("chara").item(0) as HTMLDivElement).style.backgroundImage = "url(" + Loader.b64imgs["b64_bust_" + this._chara.code] + ")";
		this._btnList["close"] = new PageButton(this.window.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PageButton(this.window, false);
		// トリガーリセット
		Ctrl.trigger_mup = false;
		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		// ボタン押下確認
		for(var name in this._btnList){this._btnList[name].calc(true);}
		// キャンバス計算
		this._page.ccvs.calc(false);

		// 閉じるボタン
		if(active && this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._page.serialPush(new SECchatMain(this._page));
			return false;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function popupDispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

