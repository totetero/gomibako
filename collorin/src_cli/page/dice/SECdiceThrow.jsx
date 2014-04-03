import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../bb3d/Dice.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "PECdiceMessage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

 // さいころ回転
class SECdiceRoll extends EventCartridge{
	var _page : DicePage;
	var _cartridge : EventCartridge;
	var _message : string;
	var _request : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, message : string, request : variant){
		this._page = page;
		this._cartridge = cartridge;
		this._message = message;
		this._request = request;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ初期化
		var num = this._request["num"] as int;
		this._page.ccvs.dices.length = 0;
		for(var i = 0; i < num; i++){
			this._page.ccvs.dices.push(new DrawThrowDice(num, i));
		}
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_xb = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("なげる", "もどる", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
		this._page.parallelPush(new PECdiceMessage(this._page, this._message, true, -1));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, null, null);

		// なげるボタン
		if(Ctrl.trigger_zb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceThrow(this._page, this._request));
			exist = false;
		}

		// もどるボタン
		if(Ctrl.trigger_xb){
			Sound.playSE("ng");
			this._page.ccvs.dices.length = 0;
			this._page.serialPush(this._cartridge);
			this._page.parallelPush(new PECdiceMessage(this._page, "", false, -1));
			exist = false;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// さいころ投擲
class SECdiceThrow extends EventCartridge{
	var _page : DicePage;
	var _request : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, request : variant){
		this._page = page;
		this._request = request;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ設定
		for(var i = 0; i < this._page.ccvs.dices.length; i++){this._page.ccvs.dices[i].start();}
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
		// さいころ通信
		Loader.loadxhr("/dice", this._request, function(response : variant) : void{
			Loader.loadImg(response["imgs"] as Map.<string>, function() : void{
				// 通信成功
				this._request = null;
				var pip = this._page.parseDice(response["list"] as variant[]);
				// さいころ目を設定
				for(var i = 0; i < this._page.ccvs.dices.length; i++){this._page.ccvs.dices[i].pip = pip[i];}
				// トリガーリセット
				Ctrl.trigger_xb = false;
				// コントローラーを表示
				this._page.parallelPush(new PECopenRctrl("", "スキップ", "", ""));
			}, function():void{
				// 画像ロード失敗
			});
		}, function() : void{
			// 情報ロード失敗
		});
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, null, null);

		if(this._request == null){
			// さいころ完了確認
			var throwing = false;
			for(var i = 0; i < ccvs.dices.length; i++){throwing = throwing || ccvs.dices[i].throwing;}

			// 演出終了もしくはスキップボタン
			if(!throwing || Ctrl.trigger_xb){
				if(Ctrl.trigger_xb){Sound.playSE("ok");}
				this._page.ccvs.dices.length = 0;
				exist = false;
			}
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

