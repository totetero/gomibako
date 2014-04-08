import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../bb3d/Dice.jsx";
import "../core/Transition.jsx";
import "../core/SECload.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";
import "PECdiceMessage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ回転
class SECdiceDiceRoll extends EventCartridge{
	var page : DicePage;
	var _cartridge : EventCartridge;
	var message : string;
	var _request : variant;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, message : string, request : variant){
		this.page = page;
		this._cartridge = cartridge;
		this.message = message;
		this._request = request;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// さいころ初期化
		var num = this._request["num"] as int;
		this.page.ccvs.dices.length = 0;
		for(var i = 0; i < num; i++){
			this.page.ccvs.dices.push(new DrawThrowDice(num, i, this._request["fix"] as int));
		}
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_sb = false;
		// コントローラーを表示
		this.page.parallelPush(new PECopenLctrl(false));
		this.page.parallelPush(new PECopenRctrl("なげる", "", "", "もどる"));
		this.page.parallelPush(new PECopenCharacter("", ""));
		this.page.parallelPush(new PECdiceMessage(this.page, this.message, true, -1));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this.page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, null, null);

		// 十字キー
		this.calcArrow(this._request);

		// なげるボタン
		if(Ctrl.trigger_zb){
			Sound.playSE("ok");
			this.page.serialPush(new SECdiceDiceThrow(this.page, this._request));
			this.page.parallelPush(new PECdiceMessage(this.page, this.message, false, -1));
			exist = false;
		}

		// もどるボタン
		if(Ctrl.trigger_sb){
			Sound.playSE("ng");
			this.page.ccvs.dices.length = 0;
			this.page.serialPush(this._cartridge);
			this.page.parallelPush(new PECdiceMessage(this.page, "", false, -1));
			exist = false;
		}

		// キャンバス描画
		this.page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 十字キー計算
	function calcArrow(request : variant) : void{
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// さいころ回転と方向転換
class SECdiceDiceRollTurn extends SECdiceDiceRoll{
	var _player : DiceCharacter;
	var _movable0 : boolean;
	var _movable1 : boolean;
	var _movable2 : boolean;
	var _movable3 : boolean;
	var _movable4 : boolean;
	var _movable5 : boolean;
	var _index : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, message : string, request : variant, player : DiceCharacter){
		super(page, cartridge, message, request);
		this._player = player;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		var exist = super.init();
		// コントローラーを上書き
		this.page.parallelPush(new PECopenLctrl(true));
		this.page.parallelPush(new PECdiceMessage(this.page, this.message + "<br> 十字キーで方向を決めて！", true, -1));
		// プレイヤー周囲の存在するヘックスを調べる
		var ccvs = this.page.ccvs;
		var hex = ccvs.field.getHexFromCoordinate(this._player.x, this._player.y);
		this._movable0 = (ccvs.field.getHexFromIndex(hex.x + 1, hex.y + 0).type > 0);
		this._movable1 = (ccvs.field.getHexFromIndex(hex.x + 0, hex.y + 1).type > 0);
		this._movable2 = (ccvs.field.getHexFromIndex(hex.x - 1, hex.y + 1).type > 0);
		this._movable3 = (ccvs.field.getHexFromIndex(hex.x - 1, hex.y + 0).type > 0);
		this._movable4 = (ccvs.field.getHexFromIndex(hex.x + 0, hex.y - 1).type > 0);
		this._movable5 = (ccvs.field.getHexFromIndex(hex.x + 1, hex.y - 1).type > 0);
		// 存在するヘックスのうち、もとの向きが一番近いヘックスの方向をしらべる
		var rot0 = 180;
		var pr = this._player.r * 180 / Math.PI;
		while(pr < -180){pr += 360;}
		while(pr > 180){pr -= 360;}
		if(this._movable0){var rot1 = pr -   0; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 0;}}
		if(this._movable1){var rot1 = pr -  60; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 1;}}
		if(this._movable2){var rot1 = pr - 120; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 2;}}
		if(this._movable3){var rot1 = pr + 180; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 3;}}
		if(this._movable4){var rot1 = pr + 120; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 4;}}
		if(this._movable5){var rot1 = pr +  60; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; this._index = 5;}}
		return exist;
	}

	// ----------------------------------------------------------------
	// 十字キー計算
	override function calcArrow(request : variant) : void{
		var ccvs = this.page.ccvs;
		var dir = 0;
		var isMove = true;
		if     (Ctrl.krt && Ctrl.kup){dir = 1.75;}
		else if(Ctrl.klt && Ctrl.kup){dir = 1.25;}
		else if(Ctrl.klt && Ctrl.kdn){dir = 0.75;}
		else if(Ctrl.krt && Ctrl.kdn){dir = 0.25;}
		else if(Ctrl.krt){dir = 0.00;}
		else if(Ctrl.kup){dir = 1.50;}
		else if(Ctrl.klt){dir = 1.00;}
		else if(Ctrl.kdn){dir = 0.50;}
		else{isMove = false;}
		if(isMove){
			// 角度を使いやすい形に変換する
			dir = 180 * (dir - ccvs.rotv / Math.PI);
			while(dir < 0){dir += 360;}
			while(dir > 360){dir -= 360;}
			// 十字キーの先のヘックスを調べる
			var index = -1;
			if(this._movable0 && (dir < 30 + 45 || 330 - 45 < dir)){index = 0;}
			if(this._movable1 && (dir < 90 + 45 || 30 - 45 + 360 < dir)){index = (index < 0) ? 1 : 6;}
			if(this._movable2 &&  90 - 45 < dir && dir < 150 + 45){index = (index < 0) ? 2 : 6;}
			if(this._movable3 && 150 - 45 < dir && dir < 210 + 45){index = (index < 0) ? 3 : 6;}
			if(this._movable4 && 210 - 45 < dir && dir < 270 + 45){index = (index < 0) ? 4 : 6;}
			if(this._movable5 && (dir < 330 + 45 - 360 || 270 - 45 < dir)){index = (index < 0) ? 5 : 6;}
			if(0 <= index && index < 6){this._index = index;}
		}

		if(0 <= this._index && this._index < 6){
			// プレイヤーの方向転換
			this._player.r = Math.PI * this._index / 3;
			// 移動先をリクエストに入れる
			var hex = ccvs.field.getHexFromCoordinate(this._player.x, this._player.y);
			switch(this._index){
				case 0: request["dst"] = [hex.x + 1, hex.y + 0]; break;
				case 1: request["dst"] = [hex.x + 0, hex.y + 1]; break;
				case 2: request["dst"] = [hex.x - 1, hex.y + 1]; break;
				case 3: request["dst"] = [hex.x - 1, hex.y + 0]; break;
				case 4: request["dst"] = [hex.x + 0, hex.y - 1]; break;
				case 5: request["dst"] = [hex.x + 1, hex.y - 1]; break;
			}
			this._index = -1;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ投擲
class SECdiceDiceThrow extends EventCartridge{
	var _page : DicePage;
	var _request : variant;
	var _action = 0;

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
				var diceResponse = this._page.parse(response["list"] as variant[]);
				// さいころ目を設定
				var pip = diceResponse["pip"] as int[];
				for(var i = 0; i < this._page.ccvs.dices.length; i++){this._page.ccvs.dices[i].pip = pip[i];}
				// テスト SP消費
				var chara = this._page.ccvs.member[diceResponse["id"] as string];
				chara.sp -= 10;
				this._page.parallelPush(new PECdicePlayerGauge(this._page, chara, -1));
				// トリガーリセット
				Ctrl.trigger_sb = false;
				// コントローラーを表示
				if(this._action < 35){this._page.parallelPush(new PECopenRctrl("", "", "", "スキップ"));}
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

		// ローディング
		if(35 < this._action || this._request != null){this._action++;}
		var display = (35 < this._action && (this._action < 45 || this._request != null));
		SECload.loading(display, this._action);

		if(this._request == null && !display){
			// さいころ完了確認
			var throwing = false;
			for(var i = 0; i < ccvs.dices.length; i++){throwing = throwing || ccvs.dices[i].throwing;}

			// 演出終了もしくはスキップボタン
			if(!throwing || Ctrl.trigger_sb){
				if(Ctrl.trigger_sb){Sound.playSE("ok");}
				this._page.ccvs.dices.length = 0;
				this._page.parallelPush(new PECdiceMessage(this._page, "", false, -1));
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

