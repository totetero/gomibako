import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../core/Transition.jsx";
import "../core/SECload.jsx";

import "DicePage.jsx";
import "DiceCanvas.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";
import "PECdiceMessage.jsx";
import "SECdiceMap.jsx";
import "SECdicePopupMenu.jsx";
import "SECdicePopupInfoChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceMoveManual extends EventCartridge{
	var _page : DicePage;
	var _player : DiceCharacter;
	var _pip : int;
	var _display = false;
	var _srcList = new int[][];
	var _dstList = new int[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, response : variant){
		this._page = page;
		this._player = this._page.ccvs.member[response["id"] as string];
		this._pip = response["pip"] as int;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
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
		this._page.parallelPush(new PECopenCharacter("", ""));
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._player, -1));
		this._page.parallelPush(new PECdiceMessage(this._page, "あと" + this._pip + "マス", !this._display, -1));
		this._display = true;
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, function() : void{
			// フィールド押下
			var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			log "field " + hex.x + " " + hex.y;
		}, function() : void{
			// キャラクター押下
			Sound.playSE("ok");
			this._page.serialPush(new SECdicePopupInfoChara(this._page, this, ccvs.member[ccvs.tappedCharacter], 0));
			exist = false;
		});

		if(Ctrl.trigger_cb){
			// マップボタン
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceMap(this._page, this));
			exist = false;
		}else if(Ctrl.trigger_sb){
			// メニューボタン
			Sound.playSE("ok");
			this._page.serialPush(new SECdicePopupMenu(this._page, this, 0));
			exist = false;
		}else if(this._player.dstList.length > 0){
			// ヘックス目的地移動完了を待つ
		}else if(Ctrl.trigger_xb){
			// 一つ戻るボタン
			Sound.playSE("ng");
			Ctrl.trigger_xb = false;
			if(this._srcList.length > 0){
				this._pip++;
				this._player.dstList.unshift(this._srcList.shift());
				this._page.parallelPush(new PECdiceMessage(this._page, "あと" + this._pip + "マス", false, -1));
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
				var hex = ccvs.field.getHexFromCoordinate(this._player.x, this._player.y);
				var x0 = hex.x;
				var y0 = hex.y;
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
				var x1 = x0;
				var y1 = y0;
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
					var faceId = "";
					for(var id in ccvs.member){
						var member = ccvs.member[id];
						if(this._player == member){continue;}
						var hex = ccvs.field.getHexFromCoordinate(member.x, member.y);
						if(x1 == hex.x && y1 == hex.y){
							faceId = id;
							break;
						}
					}
					if(faceId != ""){
						// 対面イベント発生 キャラクターが向き合う
						var member = ccvs.member[faceId];
						var r = Math.atan2(member.y - this._player.y, member.x - this._player.x);
						this._player.r = r;
						member.r = r + Math.PI;
						// カメラ設定
						var camera = 0;
						if(this._player.side != member.side){
							camera = 2;
							this._page.ccvs.center = [this._player, member];
						}
						// 移動完了
						this._page.serialPush(new SECloadDice(this._page, camera, {type: "move", dst: this._dstList, face: faceId}));
						this._page.parallelPush(new PECdiceMessage(this._page, "", false, -1));
						exist = false;
					}else{
						// 対面イベントが発生しないならば移動先のヘックスに移動する
						this._player.dstList.unshift([x1, y1] : int[]);
						if(this._srcList.length > 0 && this._player.dstList[0][0] == this._srcList[0][0] && this._player.dstList[0][1] == this._srcList[0][1]){
							this._pip++;
							this._srcList.shift();
							this._dstList.pop();
						}else{
							this._pip--;
							this._srcList.unshift([x0, y0] : int[]);
							this._dstList.push([x1, y1] : int[]);
						}
						this._player.motion = "walk";
						this._page.parallelPush(new PECdiceMessage(this._page, "あと" + this._pip + "マス", false, -1));
						// 強制停止系のイベントタイルを確認する
						if(this._srcList.length > 0 && ccvs.field.getHexFromIndex(x1, y1).type == 2){
							this._pip = 0;
						}
					}
				}
			}
		}else{
			// 移動完了
			this._page.serialPush(new SECloadDice(this._page, 0, {type: "move", dst: this._dstList}));
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

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくページ情報読み込み
class SECloadDice extends SECload{
	var _ccvs : DiceCanvas;
	var _camera : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, camera : int, request : variant){
		super("/dice", request, function(response : variant) : void{
			// ロード完了 データの形成
			page.parse(response["list"] as variant[]);
		});
		this._ccvs = page.ccvs;
		this._camera = camera;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		super.init();
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		// キャンバス計算
		this._ccvs.calc(true, this._camera, null, null);

		// ローダー計算
		var exist = super.calc();

		// キャンバス描画
		this._ccvs.draw();
		return exist;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

