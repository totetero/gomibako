import "js/web.jsx";

import "../../util/Sound.jsx";
import "../../util/EventCartridge.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopup.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "SECdiceDice.jsx";

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
			<div class="core-btn skill1">ダブルさいころ</div>
			<div class="core-btn skill2">6が出るさいころ</div>
			<div class="core-btn skill3">レーザービーム</div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : DicePage;
	var _cartridge : EventCartridge;
	var _btnList : Map.<PartsButton>;
	var _player : DiceCharacter;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, player : DiceCharacter){
		this._page = page;
		this._cartridge = cartridge;
		this._player = player;
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
		this._btnList["skill1"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn skill1").item(0) as HTMLDivElement, true);
		this._btnList["skill2"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn skill2").item(0) as HTMLDivElement, true);
		this._btnList["skill3"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn skill3").item(0) as HTMLDivElement, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["skill1"].zKey = true;
		this._btnList["skill2"].xKey = true;
		this._btnList["skill3"].cKey = true;
		this._btnList["close"].sKey = true;
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

		// テスト スキル1ボタン
		if(this._btnList["skill1"].trigger){
			this._btnList["skill1"].trigger = false;
			if(active){
				Sound.playSE("ok");
				this._page.serialPush(new SECdiceDiceRoll(this._page, this._cartridge, "ダブルさいころ", {
					"type": "dice",
					"num": 2,
					"fix": 0,
				}));
				exist = false;
			}
		}

		// テスト スキル2ボタン
		if(this._btnList["skill2"].trigger){
			this._btnList["skill2"].trigger = false;
			if(active){
				Sound.playSE("ok");
				this._page.serialPush(new SECdiceDiceRoll(this._page, this._cartridge, "6が出るさいころ", {
					"type": "dice",
					"num": 1,
					"fix": 6,
				}));
				exist = false;
			}
		}

		// テスト スキル3ボタン
		if(this._btnList["skill3"].trigger){
			this._btnList["skill3"].trigger = false;
			if(active){
				Sound.playSE("ok");
				this._page.serialPush(new SECdiceDiceRollTurn(this._page, this._cartridge, "レーザービーム", {
					"type": "beam",
					"num": 1,
					"fix": 0,
				}, this._player));
				exist = false;
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

