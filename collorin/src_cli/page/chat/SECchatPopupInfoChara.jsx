import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../page/PartsButton.jsx";
import "../page/Transition.jsx";
import "../page/SECpopup.jsx";

import "ChatPage.jsx";
import "ChatCanvas.jsx";
import "SECchatMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページキャラクター情報ポップアップイベントカートリッジ
class SECchatPopupInfoChara extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
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
	var _btnList : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, chara : ChatCharacter){
		this._page = page;
		this._chara = chara;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function popupInit() : void{
		this.popupDiv.className = "core-popup core infoChara";
		this.popupDiv.innerHTML = SECchatPopupInfoChara._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;

		(this.windowDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._chara.name;
		(this.windowDiv.getElementsByClassName("chara").item(0) as HTMLDivElement).style.backgroundImage = "url(" + Loader.b64s["b64_bust_" + this._chara.code] + ")";

		this._btnList = {} : Map.<PartsButton>;
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		// ボタン押下確認
		for(var name in this._btnList){this._btnList[name].calc(true);}
		// キャンバス計算
		this._page.ccvs.calc(false, null, null);

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._btnList["close"].trigger = false;
			this._btnList["outer"].trigger = false;
			if(active){
				Sound.playSE("ng");
				this._page.serialPush(new SECchatMain(this._page));
				return false;
			}
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

