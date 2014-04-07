import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../bb3d/Dice.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";
import "PECdiceMessage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ回転
class SECdiceDiceRoll extends EventCartridge{
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
			this._page.ccvs.dices.push(new DrawThrowDice(num, i, this._request["fix"] as int));
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

		// 十字キー
		this.calcArrow(this._request);

		// なげるボタン
		if(Ctrl.trigger_zb){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceThrow(this._page, this._request));
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

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, cartridge : EventCartridge, message : string, request : variant, player : DiceCharacter){
		super(page, cartridge, message, request);
		this._player = player;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		var ccvs = this._page.ccvs;
		var exist = super.init();
		this._page.parallelPush(new PECopenLctrl(true));
		// プレイヤーの現在座標
		var hex = ccvs.field.getHexFromCoordinate(this._player.x, this._player.y);
		var x0 = hex.x;
		var y0 = hex.y;
		var x1 = x0;
		var y1 = y0;
		// 周囲の存在するヘックスを調べる
		this._movable0 = (ccvs.field.getHexFromIndex(x0 + 1, y0 + 0).type > 0);
		this._movable1 = (ccvs.field.getHexFromIndex(x0 + 0, y0 + 1).type > 0);
		this._movable2 = (ccvs.field.getHexFromIndex(x0 - 1, y0 + 1).type > 0);
		this._movable3 = (ccvs.field.getHexFromIndex(x0 - 1, y0 + 0).type > 0);
		this._movable4 = (ccvs.field.getHexFromIndex(x0 + 0, y0 - 1).type > 0);
		this._movable5 = (ccvs.field.getHexFromIndex(x0 + 1, y0 - 1).type > 0);
		// 存在するヘックスのうち、もとの向きが一番近いヘックスの方向を向く
		var rot0 = 180;
		var pr = this._player.r * 180 / Math.PI;
		while(pr < -180){pr += 360;}
		while(pr > 180){pr -= 360;}
		if(this._movable0){var rot1 = pr -   0; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 + 1; y1 = y0 + 0; this._player.r = Math.PI * 0 / 3;}}
		if(this._movable1){var rot1 = pr -  60; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 + 0; y1 = y0 + 1; this._player.r = Math.PI * 1 / 3;}}
		if(this._movable2){var rot1 = pr - 120; if(rot1 < -180){rot1 += 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 - 1; y1 = y0 + 1; this._player.r = Math.PI * 2 / 3;}}
		if(this._movable3){var rot1 = pr + 180; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 - 1; y1 = y0 + 0; this._player.r = Math.PI * 3 / 3;}}
		if(this._movable4){var rot1 = pr + 120; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 + 0; y1 = y0 - 1; this._player.r = Math.PI * 4 / 3;}}
		if(this._movable5){var rot1 = pr +  60; if(rot1 >  180){rot1 -= 360;} rot1 = Math.abs(rot1); if(rot0 > rot1){rot0 = rot1; x1 = x0 + 1; y1 = y0 - 1; this._player.r = Math.PI * 5 / 3;}}
		return exist;
	}

	// ----------------------------------------------------------------
	// 十字キー計算
	override function calcArrow(request : variant) : void{
		var ccvs = this._page.ccvs;
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
			// プレイヤーの現在座標
			var hex = ccvs.field.getHexFromCoordinate(this._player.x, this._player.y);
			var x0 = hex.x;
			var y0 = hex.y;
			var x1 = x0;
			var y1 = y0;
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
			// 移動先を変数に入れる
			switch(index){
				case 0: x1 = x0 + 1; y1 = y0 + 0; this._player.r = Math.PI * 0 / 3; break;
				case 1: x1 = x0 + 0; y1 = y0 + 1; this._player.r = Math.PI * 1 / 3; break;
				case 2: x1 = x0 - 1; y1 = y0 + 1; this._player.r = Math.PI * 2 / 3; break;
				case 3: x1 = x0 - 1; y1 = y0 + 0; this._player.r = Math.PI * 3 / 3; break;
				case 4: x1 = x0 + 0; y1 = y0 - 1; this._player.r = Math.PI * 4 / 3; break;
				case 5: x1 = x0 + 1; y1 = y0 - 1; this._player.r = Math.PI * 5 / 3; break;
			}
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

