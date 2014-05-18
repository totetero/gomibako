import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../core/data/DataChara.jsx";
import "../core/data/SECpopupDataChara.jsx";
import "../core/load/SECload.jsx";
import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";
import "SECdiceMap.jsx";
import "SECdicePopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろく移動カートリッジ
class SECdiceMoveManual implements SerialEventCartridge{
	var _page : PageDice;
	var _player : Bb3dDiceCharacter;
	var _pip : int;
//	var _display = false;
	var _srcList = new int[][];
	var _dstList = new int[][];
	var _btnList = {} : Map.<PartsButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		this._player = this._page.bcvs.member[response["id"] as string];
		this._pip = response["pip"] as int;

		// ボタン作成
		this._btnList["lchara"] = new PartsButton(0, 0, 50, 50, true);
		this._btnList["rchara"] = new PartsButton(0, 0, 50, 50, true);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 2.5;
		this._page.bcvs.cameraCenter = [this._player];
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._page.gauge.setLeft(this._player, 0);
		this._page.message.set("あと" + this._pip + "マス", "move", 0);
		this._page.ctrler.setLctrl(true);
		this._page.ctrler.setRctrl("", "一歩戻る", "マップ", "メニュー");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;
		Ctrl.trigger_x = false;
		Ctrl.trigger_c = false;
		Ctrl.trigger_s = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;
		this._btnList["rchara"].x = Ctrl.screen.w - 50;
		bcvs.calcButton(this._btnList);
		this._page.gauge.lActive = this._btnList["lchara"].active;
		this._page.gauge.rActive = this._btnList["rchara"].active;
		var request : variant = null;

		// 左ゲージアイコンタップ
		if(this._page.gauge.lChara != null && this._btnList["lchara"].trigger){
			Sound.playSE("ok");
			bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.lChara));
			return false;
		}

		// 右ゲージアイコンタップ
		if(this._page.gauge.rChara != null && this._btnList["rchara"].trigger){
			Sound.playSE("ok");
			bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.gauge.rChara));
			return false;
		}

		// キャラクタータップ
		if(bcvs.charaTrigger != null){
			Sound.playSE("ok");
			bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, bcvs.charaTrigger));
			return false;
		}

		// マップボタン
		if(Ctrl.trigger_c){
			Sound.playSE("ok");
			this._page.serialPush(new SECdiceMap(this._page, this));
			return false;
		}

		// メニューボタン
		if(Ctrl.trigger_s){
			Sound.playSE("ok");
			this._page.bust.set(null);
			bcvs.cameraLock = true;
			this._page.serialPush(new SECdicePopupMenu(this._page, this));
			return false;
		}

		if(this._player.dstList.length > 0){
			// ヘックス目的地移動完了を待つ
		}else if(Ctrl.trigger_x){
			// 一つ戻るボタン
			Sound.playSE("ng");
			Ctrl.trigger_x = false;
			if(this._srcList.length > 0){
				this._pip++;
				this._player.dstList.unshift(this._srcList.shift());
				this._page.message.set("あと" + this._pip + "マス", "move", 0);
			}
		}else if(this._pip > 0){
			// ヘックス目的地の十字キー指定
			var dir = 0;
			var isMove = true; // TODO -------- 関数化 --------
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
				var hex = bcvs.field.getHexFromCoordinate(this._player.x, this._player.y);
				var x0 = hex.x;
				var y0 = hex.y;
				// 周囲の存在するヘックスを調べる
				var movable0 = (bcvs.field.getHexFromIndex(x0 + 1, y0 + 0).type > 0);
				var movable1 = (bcvs.field.getHexFromIndex(x0 + 0, y0 + 1).type > 0);
				var movable2 = (bcvs.field.getHexFromIndex(x0 - 1, y0 + 1).type > 0);
				var movable3 = (bcvs.field.getHexFromIndex(x0 - 1, y0 + 0).type > 0);
				var movable4 = (bcvs.field.getHexFromIndex(x0 + 0, y0 - 1).type > 0);
				var movable5 = (bcvs.field.getHexFromIndex(x0 + 1, y0 - 1).type > 0);
				// 角度を使いやすい形に変換する
				dir = 180 * (dir - bcvs.rotv / Math.PI);
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
					for(var id in bcvs.member){
						var member = bcvs.member[id];
						if(this._player == member){continue;}
						var hex = bcvs.field.getHexFromCoordinate(member.x, member.y);
						if(x1 == hex.x && y1 == hex.y){
							faceId = id;
							break;
						}
					}
					if(faceId != ""){
						// 対面イベント発生 キャラクターが向き合う
						var member = bcvs.member[faceId];
						var r = Math.atan2(member.y - this._player.y, member.x - this._player.x);
						this._player.r = r;
						member.r = r + Math.PI;
						// カメラ設定
						if(this._player.side != member.side){
							bcvs.cameraScale = 4;
							bcvs.cameraCenter = [this._player, member];
						}
						// 移動完了 通信の準備
						request = {
							type: "move",
							dst: this._dstList,
							face: faceId
						};
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
						this._page.message.set("あと" + this._pip + "マス", "move", 0);
						// 強制停止系のイベントタイルを確認する
						if(this._srcList.length > 0 && bcvs.field.getHexFromIndex(x1, y1).type == 2){
							this._pip = 0;
						}
					}
				}
			}
		}else{
			// 移動完了 通信の準備
			request = {
				type: "move",
				dst: this._dstList
			};
		}

		// 通信を行う
		if(request != null){
			// クロス設定
			this._page.message.set("", "", 0);
			this._page.ctrler.setLctrl(false);
			this._page.ctrler.setRctrl("", "", "", "");
			// 通信開始
			this._page.serialPush(new SECload(this, "/dice", request, function(response : variant) : void{
				this._page.parse(response["list"] as variant[]);
			}));
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
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

