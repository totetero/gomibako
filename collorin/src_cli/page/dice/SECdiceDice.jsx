import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../../bb3d/Bb3dDice.jsx";

import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくさいころ回転カートリッジ
class SECdiceDiceRoll implements SerialEventCartridge{
	static var _rollRotq : number[];
	static const _layout = [
		[[-80, 80]],
		[[-110, 70], [-50, 90]],
		[[-50, 70], [-110, 90], [-50, 110]],
		[[-90, 50], [-30, 70], [-120, 90], [-60, 110]]
	];

	var _page : PageDice;
	var _cartridge : SerialEventCartridge;
	var _code : string;
	var _message : string;
	var _request : variant;

	// 方向転換用変数
	var _player : Bb3dDiceCharacter;
	var _movable0 : boolean;
	var _movable1 : boolean;
	var _movable2 : boolean;
	var _movable3 : boolean;
	var _movable4 : boolean;
	var _movable5 : boolean;
	var _index : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, cartridge : SerialEventCartridge, code : string, message : string, request : variant, player : Bb3dDiceCharacter){
		this._page = page;
		this._cartridge = cartridge;
		this._code = code;
		this._message = message;
		this._request = request;
		this._player = player;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isTapChara = false;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._page.ctrler.setLctrl(this._player != null);
		this._page.ctrler.setRctrl("なげる", "", "", "もどる");
		// トリガーリセット
		this._page.ctrler.z_Trigger = false;
		this._page.ctrler.s_Trigger = false;

		// さいころ初期化
		var num = this._request["num"] as int;
		var fix = this._request["fix"] as int;
		var size = 50 - 3 * num;
		this._page.bcvs.dices.length = 0;
		for(var i = 0; i < num; i++){
			var dice = new Bb3dDice(this._code, size);
			if(fix > 0){dice.pip1 = dice.pip2 = dice.pip3 = dice.pip4 = dice.pip5 = dice.pip6 = fix;}
			dice.x = SECdiceDiceRoll._layout[num - 1][i][0];
			dice.y = SECdiceDiceRoll._layout[num - 1][i][1];
			dice.setRandomQuat();
			this._page.bcvs.dices.push(dice);
		}

		// 方向転換初期化
		if(this._player != null){this._initTurn();}

		// さいころ回転のクオータニオン初期化
		if(SECdiceDiceRoll._rollRotq == null){
			SECdiceDiceRoll._rollRotq = new number[];
			Bb3dDice.setQuat(SECdiceDiceRoll._rollRotq, 1, 0, 0, -0.4);
		}
	}

	// 方向転換初期化
	function _initTurn() : void{
		// プレイヤー周囲の存在するヘックスを調べる
		var hex = this._page.bcvs.field.getHexFromCoordinate(this._player.x, this._player.y);
		this._movable0 = (this._page.bcvs.field.getHexFromIndex(hex.x + 1, hex.y + 0).type > 0);
		this._movable1 = (this._page.bcvs.field.getHexFromIndex(hex.x + 0, hex.y + 1).type > 0);
		this._movable2 = (this._page.bcvs.field.getHexFromIndex(hex.x - 1, hex.y + 1).type > 0);
		this._movable3 = (this._page.bcvs.field.getHexFromIndex(hex.x - 1, hex.y + 0).type > 0);
		this._movable4 = (this._page.bcvs.field.getHexFromIndex(hex.x + 0, hex.y - 1).type > 0);
		this._movable5 = (this._page.bcvs.field.getHexFromIndex(hex.x + 1, hex.y - 1).type > 0);
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
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// さいころ回転
		for(var i = 0; i < this._page.bcvs.dices.length; i++){
			var dice = this._page.bcvs.dices[i];
			Bb3dDice.multiQuat(dice.rotq, SECdiceDiceRoll._rollRotq, dice.rotq);
		}

		// 方向転換計算
		if(this._player != null){this._calcTurn();}

		// なげるボタン
		if(this._page.ctrler.z_Trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceDiceThrow(this._page, this._request));
			return false;
		}

		// もどるボタン
		if(this._page.ctrler.s_Trigger){
			Sound.playSE("ng");
			this._page.bcvs.dices.length = 0;
			this._page.serialPush(this._cartridge);
			return false;
		}

		return true;
	}

	// 方向転換計算
	function _calcTurn() : void{
		var dir = 0;
		var isMove = true;
		var ctrl = this._page.ctrler;
		if     (ctrl.rtActive && ctrl.upActive){dir = 1.75;}
		else if(ctrl.ltActive && ctrl.upActive){dir = 1.25;}
		else if(ctrl.ltActive && ctrl.dnActive){dir = 0.75;}
		else if(ctrl.rtActive && ctrl.dnActive){dir = 0.25;}
		else if(ctrl.rtActive){dir = 0.00;}
		else if(ctrl.upActive){dir = 1.50;}
		else if(ctrl.ltActive){dir = 1.00;}
		else if(ctrl.dnActive){dir = 0.50;}
		else{isMove = false;}
		if(isMove){
			// 角度を使いやすい形に変換する
			dir = 180 * (dir - this._page.bcvs.rotv / Math.PI);
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
			var hex = this._page.bcvs.field.getHexFromCoordinate(this._player.x, this._player.y);
			switch(this._index){
				case 0: this._request["dst"] = [hex.x + 1, hex.y + 0]; break;
				case 1: this._request["dst"] = [hex.x + 0, hex.y + 1]; break;
				case 2: this._request["dst"] = [hex.x - 1, hex.y + 1]; break;
				case 3: this._request["dst"] = [hex.x - 1, hex.y + 0]; break;
				case 4: this._request["dst"] = [hex.x + 0, hex.y - 1]; break;
				case 5: this._request["dst"] = [hex.x + 1, hex.y - 1]; break;
			}
			this._index = -1;
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.drawBeforeCross();
		this._page.drawAfterCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくさいころ投擲カートリッジ
class SECdiceDiceThrow implements SerialEventCartridge{
	static const _frame = 15;
	static var _lastRotq : number[];

	var _page : PageDice;
	var _request : variant;
	var _diceState = new SECdiceDiceThrow._DiceState[];
	var _loadCount = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, request : variant){
		this._page = page;
		this._request = request;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isTapChara = false;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "");

		// さいころ初期化
		for(var i = 0; i < this._page.bcvs.dices.length; i++){
			this._diceState[i] = new SECdiceDiceThrow._DiceState();
			this._diceState[i].dice = this._page.bcvs.dices[i];
			this._diceState[i].mode = 0;
			this._diceState[i].action = 1 + (i == 0 ? 0 : Math.floor(Math.random() * 5));
		}

		// ロード開始
		Loader.loadxhr("/dice", this._request, function(response : variant) : void{
			Loader.loadContents(response["contents"] as Map.<string>, function() : void{
				if(this._loadCount > 24){Loading.hide();}
				// 通信成功
				this._request = null;
				var diceResponse = this._page.parse(response["list"] as variant[]);
				// さいころ目を設定
				var pip = diceResponse["pip"] as int[];
				for(var i = 0; i < this._diceState.length; i++){this._diceState[i].pip = pip[i];}
				// テスト SP消費
				var chara = this._page.bcvs.member[diceResponse["id"] as string];
				chara.sp -= 10;
				// クロス設定
				if(this._loadCount < 24){this._page.ctrler.setRctrl("", "", "", "スキップ");}
				// トリガーリセット
				this._page.ctrler.s_Trigger = false;
			});
		});

		// さいころ回転のクオータニオン初期化
		if(SECdiceDiceThrow._lastRotq == null){
			SECdiceDiceThrow._lastRotq = new number[];
			Bb3dDice.setQuat(SECdiceDiceThrow._lastRotq, 1, 0, 0, 0.4 * SECdiceDiceThrow._frame);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// さいころ計算
		var throwing = false;
		for(var i = 0; i < this._diceState.length; i++){throwing = this._calcDice(this._diceState[i]) || throwing;}

		if(this._request == null){
			// 演出終了もしくはスキップボタン
			if(!throwing || this._page.ctrler.s_Trigger){
				if(this._page.ctrler.s_Trigger){Sound.playSE("ok");}
				this._page.bcvs.dices.length = 0;
				return false;
			}
		}else{
			if(this._loadCount++ == 24){Loading.show();}
		}

		return true;
	}

	// さいころ計算
	function _calcDice(stat : SECdiceDiceThrow._DiceState) : boolean{
		switch(stat.mode){
			case 0:
				// 回転待機
				if(stat.action > 0 && --stat.action <= 0){
					stat.mode = 1;
					stat.action = 0;
				}
				Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceRoll._rollRotq, stat.dice.rotq);
				break;
			case 1:
				// 1回めジャンプ
				if(stat.action++ < SECdiceDiceThrow._frame){
					stat.dice.x += 160 / (SECdiceDiceThrow._frame * 3);
					stat.dice.y -= 120 / (SECdiceDiceThrow._frame * 3);
					stat.dice.h = 200 * Math.sin(stat.action / SECdiceDiceThrow._frame * Math.PI);
					Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceRoll._rollRotq, stat.dice.rotq);
				}else{
					stat.mode = 2;
					stat.action = 0;
					stat.dice.setRandomQuat();
				}
				break;
			case 2:
				// 2回めジャンプ
				if(stat.action++ < SECdiceDiceThrow._frame){
					stat.dice.x += 160 / (SECdiceDiceThrow._frame * 3);
					stat.dice.y -= 120 / (SECdiceDiceThrow._frame * 3);
					stat.dice.h = 100 * Math.sin(stat.action / SECdiceDiceThrow._frame * Math.PI);
					Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceRoll._rollRotq, stat.dice.rotq);
				}else{
					stat.mode = 3;
					stat.action = 0;
					stat.dice.setRandomQuat();
				}
				break;
			case 3:
				// 通信待機ジャンプ
				if(stat.action == 0 && stat.pip > 0){
					// 通信完了時
					stat.mode = 4;
					stat.action = 0;
					stat.dice.setDiceQuat(stat.pip);
					Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceThrow._lastRotq, stat.dice.rotq);
				}else if(stat.action++ < SECdiceDiceThrow._frame){
					stat.dice.h = 100 * Math.sin(stat.action / SECdiceDiceThrow._frame * Math.PI);
					Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceRoll._rollRotq, stat.dice.rotq);
				}else{
					stat.mode = 3;
					stat.action = 0;
					stat.dice.setRandomQuat();
				}
				break;
			case 4:
				// 最後のジャンプ
				if(stat.action++ < SECdiceDiceThrow._frame){
					stat.dice.x += 160 / (SECdiceDiceThrow._frame * 3);
					stat.dice.y -= 120 / (SECdiceDiceThrow._frame * 3);
					stat.dice.h = 50 * Math.sin(stat.action / SECdiceDiceThrow._frame * Math.PI);
					Bb3dDice.multiQuat(stat.dice.rotq, SECdiceDiceRoll._rollRotq, stat.dice.rotq);
					// 描画タイミングの調整
					if(stat.action == SECdiceDiceThrow._frame){stat.dice.skipCount = 0;}
				}else{
					stat.mode = 5;
					stat.action = 0;
				}
				break;
			case 5:
				// 少し待機
				if(stat.action++ >= 30){
					stat.mode = 6;
					stat.action = 0;
				}
				break;
			case 6:
				return false;
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.drawBeforeCross();
		this._page.drawAfterCross();
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}

	// ----------------------------------------------------------------
	// さいころ状態内部クラス
	class _DiceState{
		var dice : Bb3dDice;
		var mode : int;
		var action : int;
		var pip = 0;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

