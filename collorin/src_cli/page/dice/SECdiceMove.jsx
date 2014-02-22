import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Transition.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";
import "SECdiceCommand.jsx";
import "SECdiceMap.jsx";
import "SECdiceFace.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceMove extends EventCartridge{
	var _page : DicePage;
	var _player : DiceCharacter;
	var _pip : int;
	var _srcList = new int[][];
	var _dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
		this._player = this._page.ccvs.member[0][0];
		this._pip = 5;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		log "あと" + this._pip + "マス";
		// 中心キャラクター設定
		this._page.ccvs.center = [this._player];
		// トリガーリセット
		Ctrl.trigger_xb = false;
		Ctrl.trigger_cb = false;
		Ctrl.trigger_sb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(true));
		this._page.parallelPush(new PECopenRctrl("", "一歩戻る", "マップ", "メニュー"));
		this._page.parallelPush(new PECopenCharacter("", 0));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var player = ccvs.center[0];
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, function() : void{
			// フィールド押下
			var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			log "field " + hex.x + " " + hex.y;
		}, function() : void{
			// キャラクター押下
			log ccvs.member[ccvs.tappedType][ccvs.tappedCharacter];
		});

		if(Ctrl.trigger_cb){
			// マップボタン
			this._page.serialPush(new SECdiceMap(this._page, this));
			exist = false;
		}else if(Ctrl.trigger_sb){
			// メニューボタン
			Ctrl.trigger_sb = false;
		}else if(player.dstList.length > 0){
			// ヘックス目的地移動完了を待つ
		}else if(Ctrl.trigger_xb){
			// 一つ戻るボタン
			Ctrl.trigger_xb = false;
			if(this._srcList.length > 0){
				this._pip++;
				player.dstList.unshift(this._srcList.shift());
				log "あと" + this._pip + "マス";
			}
		}else if(this._pip > 0){
			// ヘックス目的地の十字キー指定
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
				var hex = ccvs.field.getHexFromCoordinate(player.x, player.y);
				var x0 = hex.x;
				var y0 = hex.y;
				var x1 = x0;
				var y1 = y0;
				// 周囲の存在するヘックスを調べる
				var movable0 = (ccvs.field.getHexFromIndex(x0 + 1, y0 + 0).type > 0);
				var movable1 = (ccvs.field.getHexFromIndex(x0 + 0, y0 + 1).type > 0);
				var movable2 = (ccvs.field.getHexFromIndex(x0 - 1, y0 + 1).type > 0);
				var movable3 = (ccvs.field.getHexFromIndex(x0 - 1, y0 + 0).type > 0);
				var movable4 = (ccvs.field.getHexFromIndex(x0 + 0, y0 - 1).type > 0);
				var movable5 = (ccvs.field.getHexFromIndex(x0 + 1, y0 - 1).type > 0);
				// 角度を使いやすい形に変換する
				dir = 180 * (dir - ccvs.rotv / Math.PI);
				while(dir < 0){dir += 360;}
				while(dir > 360){dir -= 360;}
				// 十字キーの先のヘックスを調べる
				var index = -1;
				if(movable0 && (dir < 30 + 45 || 330 - 45 < dir)){index = 0;}
				//if(movable1 &&  30 - 45 < dir && dir <  90 + 45){index = (index < 0) ? 1 : 6;}
				if(movable1 && (dir < 90 + 45 || 30 - 45 + 360 < dir)){index = (index < 0) ? 1 : 6;}
				if(movable2 &&  90 - 45 < dir && dir < 150 + 45){index = (index < 0) ? 2 : 6;}
				if(movable3 && 150 - 45 < dir && dir < 210 + 45){index = (index < 0) ? 3 : 6;}
				if(movable4 && 210 - 45 < dir && dir < 270 + 45){index = (index < 0) ? 4 : 6;}
				//if(movable5 && 270 - 45 < dir && dir < 330 + 45){index = (index < 0) ? 5 : 6;}
				if(movable5 && (dir < 330 + 45 - 360 || 270 - 45 < dir)){index = (index < 0) ? 5 : 6;}
				// 移動先を変数に入れる
				switch(index){
					case 0: x1 = x0 + 1; y1 = y0 + 0; break;
					case 1: x1 = x0 + 0; y1 = y0 + 1; break;
					case 2: x1 = x0 - 1; y1 = y0 + 1; break;
					case 3: x1 = x0 - 1; y1 = y0 + 0; break;
					case 4: x1 = x0 + 0; y1 = y0 - 1; break;
					case 5: x1 = x0 + 1; y1 = y0 - 1; break;
				}
				if(x1 != x0 || y1 != y0){
					// 対面イベント確認
					for(var i = 0; i < ccvs.member.length; i++){
						if(i != 0 && i != 1){continue;}
						for(var j = 0; j < ccvs.member[i].length; j++){
							var member = ccvs.member[i][j];
							if(player == member){continue;}
							var hex = ccvs.field.getHexFromCoordinate(member.x, member.y);
							if(x1 == hex.x && y1 == hex.y){
								// 対面イベント発生 キャラクターが向き合う
								var r = Math.atan2(member.y - player.y, member.x - player.x);
								player.r = r;
								member.r = r + Math.PI;
								// 移動完了
								log this._dstList;
								this._page.serialPush(new SECdiceFace(this._page, player, member));
								exist = false;
							}
						}
						if(!exist){break;}
					}
					if(exist){
						// 対面イベントが発生しないならば移動先のヘックスに移動する
						player.dstList.unshift([x1, y1] : int[]);
						if(this._srcList.length > 0 && player.dstList[0][0] == this._srcList[0][0] && player.dstList[0][1] == this._srcList[0][1]){
							this._pip++;
							this._srcList.shift();
							this._dstList.pop();
						}else{
							this._pip--;
							this._srcList.unshift([x0, y0] : int[]);
							this._dstList.push([x1, y1] : int[]);
						}
						player.motion = "walk";
						log "あと" + this._pip + "マス";
						// 強制停止系のイベントタイルを確認する
						if(this._srcList.length > 0 && ccvs.field.getHexFromIndex(x1, y1).type == 2){
							this._pip = 0;
						}
					}
				}
			}
		}else{
			// 移動完了
			log this._dstList;
			this._page.serialPush(new SECdiceCommand(this._page));
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

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

