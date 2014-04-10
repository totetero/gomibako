import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/EventCartridge.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/SECpopup.jsx";
import "../core/Transition.jsx";
import "../setting/SettingPage.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メニューの設定ポップアップイベントカートリッジ
class SECdicePopupMenuSetting extends SECpopup{
	// HTMLタグ
	static const _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="title">メニュー 設定</div>
			<div class="bgm"><div class="label">BGM</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow cssimg_core_picker_arrow"></div></div></div>
			<div class="sef"><div class="label">効果音</div><div class="core-picker-btn"><div class="core-picker-label"></div><div class="core-picker-arrow cssimg_core_picker_arrow"></div></div></div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : DicePage;
	var _cartridge : EventCartridge;
	var _camera : int;
	var _btnList : Map.<PartsButton>;
	var _bgmPicker : SECsettingPopupPickerBgm;
	var _sefPicker : SECsettingPopupPickerSef;

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
		this.popupDiv.className = "core-popup dice menuSetting";
		this.popupDiv.innerHTML = SECdicePopupMenuSetting._htmlTag;
		this.windowDiv = this.popupDiv.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		var bgmDiv = this.windowDiv.getElementsByClassName("bgm").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;
		var sefDiv = this.windowDiv.getElementsByClassName("sef").item(0).getElementsByClassName("core-picker-btn").item(0) as HTMLDivElement;

		// コントローラーを隠す
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));

		// ピッカー設定
		this._bgmPicker = new SECdicePopupPickerBgm(this._page, this._camera);
		this._sefPicker = new SECdicePopupPickerSef(this._page, this._camera);
		this._bgmPicker.setLabel(bgmDiv);
		this._sefPicker.setLabel(sefDiv);

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["bgm"] = new PartsButton(bgmDiv, true);
		this._btnList["sef"] = new PartsButton(sefDiv, true);
		this._btnList["close"] = new PartsButton(this.windowDiv.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PartsButton(this.windowDiv, false);
		this._btnList["close"].sKey = true;
		if(!Sound.isSupported){
			this._btnList["bgm"].inactive = true;
			this._btnList["sef"].inactive = true;
		}
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

			// BGMピッカーボタン
			if(this._btnList["bgm"].trigger){
				this._btnList["bgm"].trigger = false;
				if(active){
					Sound.playSE("ok");
					this._page.serialPush(this._bgmPicker.beforeOpen(this._page, this));
					exist = false;
				}
			}

			// 効果音ピッカーボタン
			if(this._btnList["sef"].trigger){
				this._btnList["sef"].trigger = false;
				if(active){
					Sound.playSE("ok");
					this._page.serialPush(this._sefPicker.beforeOpen(this._page, this));
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

// BGMのピッカー
class SECdicePopupPickerBgm extends SECsettingPopupPickerBgm{
	var _ccvs : DiceCanvas;
	var _camera : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, camera : int){
		super();
		this._ccvs = page.ccvs;
		this._camera = camera;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			ccvs.calc(false, this._camera, null, null);

			// ポップアップ計算
			var exist = super.popupCalc(active);
		}

		// キャンバス描画
		return ccvs.draw(exist);
	}
}

// 効果音のピッカー
class SECdicePopupPickerSef extends SECsettingPopupPickerSef{
	var _ccvs : DiceCanvas;
	var _camera : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, camera : int){
		super();
		this._ccvs = page.ccvs;
		this._camera = camera;
	}

	// ----------------------------------------------------------------
	// 計算
	override function popupCalc(active : boolean) : boolean{
		var ccvs = this._ccvs;
		var exist = true;

		if(!ccvs.calced){
			// キャンバス計算
			ccvs.calc(false, this._camera, null, null);

			// ポップアップ計算
			var exist = super.popupCalc(active);
		}

		// キャンバス描画
		return ccvs.draw(exist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

