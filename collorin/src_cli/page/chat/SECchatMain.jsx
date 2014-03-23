import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../page/Page.jsx";
import "../page/PartsButton.jsx";
import "../page/Transition.jsx";

import "ChatPage.jsx";
import "ChatCanvas.jsx";
import "SECchatPopupInfoChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページメインイベントカートリッジ
class SECchatMain extends EventCartridge{
	var _page : ChatPage;
	var _input : HTMLInputElement;
	var _btnList : Map.<PartsButton>;

	var _tappedCharacter : int = -1;
	var _socketCounter : int = 0;
	var _arrow : boolean;
	var _dst : int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage){
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		this._input = Ctrl.sDiv.getElementsByTagName("input").item(0) as HTMLInputElement;
		this._input.className = "chat";
		this._input.type = "text";
		this._input.maxLength = 20;
		this._btnList = {} : Map.<PartsButton>;
		this._btnList["send"] = new PartsButton(this._page.div.getElementsByClassName("core-btn send").item(0) as HTMLDivElement, true);
		this._btnList["exit"] = new PartsButton(this._page.div.getElementsByClassName("core-btn exit").item(0) as HTMLDivElement, true);
		// トリガーリセット
		this._page.ccvs.trigger_mup = false;
		Ctrl.trigger_enter = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(true));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var clickable = true;
		var exist = true;

		// ボタン押下確認
		for(var name in this._btnList){
			this._btnList[name].calc(!ccvs.mdn);
			clickable = clickable && !this._btnList[name].active;
		}

		// キャンバス計算
		ccvs.calc(clickable, function() : void{
			if(ccvs.player != null){
				// フィールド押下による移動
				var x = Math.floor(ccvs.tx / 16);
				var y = Math.floor(ccvs.ty / 16);
				var r = this._calcRotID(Math.atan2(ccvs.ty - ccvs.player.y, ccvs.tx - ccvs.player.x));
				this._arrow = false;
				this._checkMove(x, y, r);
			}
		}, function(chara : ChatCharacter) : void{
			// キャラクター押下によるポップアップ表示
			Sound.playSE("ok");
			this._page.serialPush(new SECchatPopupInfoChara(this._page, chara));
			exist = false;
		});

		if(ccvs.player != null){
			// 十字キーでの移動確認
			if(ccvs.player.dstList.length == 0 || !this._arrow){
				var r = 0;
				var isMove = true;
				if     (Ctrl.krt && Ctrl.kup){r = Math.PI * 1.74 - ccvs.rotv;}
				else if(Ctrl.klt && Ctrl.kup){r = Math.PI * 1.26 - ccvs.rotv;}
				else if(Ctrl.klt && Ctrl.kdn){r = Math.PI * 0.74 - ccvs.rotv;}
				else if(Ctrl.krt && Ctrl.kdn){r = Math.PI * 0.26 - ccvs.rotv;}
				else if(Ctrl.krt){r = Math.PI * 0.00 - ccvs.rotv;}
				else if(Ctrl.kup){r = Math.PI * 1.50 - ccvs.rotv;}
				else if(Ctrl.klt){r = Math.PI * 1.00 - ccvs.rotv;}
				else if(Ctrl.kdn){r = Math.PI * 0.50 - ccvs.rotv;}
				else{isMove = false;}
				if(isMove){
					var x = Math.floor(ccvs.player.x / 16);
					var y = Math.floor(ccvs.player.y / 16);
					this._arrow = true;
					switch(this._calcRotID(r)){
						case 0: this._checkMove(x + 1, y + 0, 0); break;
						case 1: this._checkMove(x + 1, y + 1, 1); break;
						case 2: this._checkMove(x + 0, y + 1, 2); break;
						case 3: this._checkMove(x - 1, y + 1, 3); break;
						case 4: this._checkMove(x - 1, y + 0, 4); break;
						case 5: this._checkMove(x - 1, y - 1, 5); break;
						case 6: this._checkMove(x + 0, y - 1, 6); break;
						case 7: this._checkMove(x + 1, y - 1, 7); break;
					}
				}
			}
		}

		// メッセージの投稿
		if(Ctrl.trigger_enter || this._btnList["send"].trigger){
			Sound.playSE("ok");
			Ctrl.trigger_enter = false;
			this._btnList["send"].trigger = false;
			this._page.socket.sendSerif(this._input.value);
			this._input.value = "";
		}

		// 退出ボタン
		if(this._btnList["exit"].trigger){
			Sound.playSE("ng");
			Page.transitionsPage("world");
		}

		// 一定間隔毎に位置の通信
		if((this._socketCounter++) % 30 == 0){
			this._page.socket.sendDestination(this._dst);
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// プレイヤーの移動確認
	function _checkMove(x : int, y : int, r : int) : void{
		var ccvs = this._page.ccvs;
		var sx : int = Math.floor(ccvs.player.x / 16);
		var sy : int = Math.floor(ccvs.player.y / 16);
		if(ccvs.field.getGridFromIndex(x, y) > 0){
			// 移動
			this._dst = [x, y, r];
			if(this._arrow){ccvs.player.dstList = [this._dst];}
			else{ccvs.player.dstList = ccvs.pathFinder.getDstList(sx, sy, this._dst);}
			ccvs.player.motion = "walk";
		}else if(r != this._calcRotID(ccvs.player.r)){
			// 方向転換
			this._dst = [sx, sy, r];
			ccvs.player.dstList = [this._dst];
		}
	}

	// ----------------------------------------------------------------
	// 角度を整数にする
	function _calcRotID(r : number) : int{
		r = 4 * r / Math.PI;
		while(r < 0){r += 8;}
		return Math.round(r) % 8;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._input.className = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

