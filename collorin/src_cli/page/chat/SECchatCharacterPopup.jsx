import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../Page.jsx";

import "ChatPage.jsx";
import "ChatCanvas.jsx";
import "SECchatMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページポップアップイベントカートリッジ
class SECchatCharacterPopup extends EventCartridge{
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
	var _popup : HTMLDivElement;
	var _window : HTMLDivElement;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, chara : ChatCharacter){
		this._page = page;
		this._chara = chara;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this._popup = this._page.div.getElementsByClassName("core-popup").item(0) as HTMLDivElement;
		this._popup.innerHTML = this._htmlTag;
		this._window = this._popup.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this._window.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._chara.name;
		(this._window.getElementsByClassName("chara").item(0) as HTMLDivElement).style.backgroundImage = "url(" + this._chara.bust + ")";
		this._btnList["close"] = new PageButton(this._window.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PageButton(this._window, false);
		// トリガーリセット
		Ctrl.trigger_mup = false;
		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;

		// ボタン押下確認
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// キャンバス座標回転と押下確認
		ccvs.calcTouchCoordinate(false);
		ccvs.calcTouchRotate();
		ccvs.calcRotate(ccvs.rotv, Math.PI / 180 * 30, 1);

		// キャラクター計算
		for(var i = 0; i < ccvs.member.length; i++){
			ccvs.member[i].calc(ccvs);
			if(!ccvs.member[i].exist){ccvs.member.splice(i--,1);}
		}

		if(ccvs.player != null){
			// カメラ位置をプレイヤーに
			ccvs.cx -= (ccvs.cx - ccvs.player.x) * 0.1;
			ccvs.cy -= (ccvs.cy - ccvs.player.y) * 0.1;
		}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._page.serialPush(new SECchatMain(this._page));
			return false;
		}

		return true;
	}


	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.ccvs.draw();
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._popup.innerHTML = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

