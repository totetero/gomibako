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

import "../core/data/SECpopupDataChara.jsx";
import "PageChat.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットカートリッジ
class SECchatMain implements SerialEventCartridge{
	var _page : PageChat;
	var _input : HTMLInputElement;
	var _btnList = {} : Map.<PartsButton>;

	var _socketCounter : int = 0;
	var _arrow : boolean;
	var _dst : int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChat, response : variant){
		this._page = page;
		this._input = dom.document.getElementById("ctrl").getElementsByTagName("input").item(0) as HTMLInputElement;

		// ボタン作成
		this._btnList["send"] = new PartsButtonBasic("送信",  -110, 10, 100, 30);
		this._btnList["back"] = new PartsButtonBasic("退出",  -110, -40, 100, 30);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.isTapChara = true;
		this._page.bcvs.isTapGrid = true;
		// クロス設定
		this._page.ctrler.setLctrl(true);
		this._page.ctrler.setRctrl("", "", "", "");
		// トリガーリセット
		for(var name in this._btnList){this._btnList[name].trigger = false;}
		this._page.bcvs.charaTrigger = null;

		// テキストエリア設定
		this._input.className = "textarea";
		this._input.type = "text";
		this._input.value = "こんにちわんこそば";
		this._input.maxLength = 20;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;
		bcvs.calcButton(this._btnList);

		// グリドタップ
		if(bcvs.gridTrigger != null){
			if(bcvs.player != null){
				// フィールド押下による移動
				var x = bcvs.gridTrigger[0];
				var y = bcvs.gridTrigger[1];
				var r = this._calcRotID(Math.atan2(bcvs.ty - bcvs.player.y, bcvs.tx - bcvs.player.x));
				this._arrow = false;
				this._checkMove(x, y, r);
			}
			bcvs.gridTrigger = null;
		}

		// キャラクタータップ
		if(bcvs.charaTrigger != null){
			Sound.playSE("ok");
			bcvs.cameraLock = true;
			this._page.serialPush(new SECpopupDataChara(this._page, this, this._page.bcvs.charaTrigger));
			return false;
		}

			if(bcvs.player != null){
				// 十字キーでの移動確認
				if(bcvs.player.dstList.length == 0 || !this._arrow){
					var r = 0;
					var isMove = true;
					if     (Ctrl.krt && Ctrl.kup){r = Math.PI * 1.74 - bcvs.rotv;}
					else if(Ctrl.klt && Ctrl.kup){r = Math.PI * 1.26 - bcvs.rotv;}
					else if(Ctrl.klt && Ctrl.kdn){r = Math.PI * 0.74 - bcvs.rotv;}
					else if(Ctrl.krt && Ctrl.kdn){r = Math.PI * 0.26 - bcvs.rotv;}
					else if(Ctrl.krt){r = Math.PI * 0.00 - bcvs.rotv;}
					else if(Ctrl.kup){r = Math.PI * 1.50 - bcvs.rotv;}
					else if(Ctrl.klt){r = Math.PI * 1.00 - bcvs.rotv;}
					else if(Ctrl.kdn){r = Math.PI * 0.50 - bcvs.rotv;}
					else{isMove = false;}
					if(isMove){
						var x = Math.floor(bcvs.player.x / 16);
						var y = Math.floor(bcvs.player.y / 16);
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
		if(this._btnList["back"].trigger){
			Sound.playSE("ng");
			Page.transitionsPage("world");
			return true;
		}

		// 一定間隔毎に位置の通信
		if((this._socketCounter++) % 30 == 0){
			this._page.socket.sendDestination(this._dst);
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		for(var name in this._btnList){
			var btn = this._btnList[name];
			if(btn.basex < 0){btn.x = Ctrl.screen.w + btn.basex;}
			if(btn.basey < 0){btn.y = Ctrl.screen.h + btn.basey;}
		}

		this._page.drawBeforeCross();

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		this._page.drawAfterCross();
	}

	// ----------------------------------------------------------------
	// プレイヤーの移動確認
	function _checkMove(x : int, y : int, r : int) : void{
		var bcvs = this._page.bcvs;
		var sx : int = Math.floor(bcvs.player.x / 16);
		var sy : int = Math.floor(bcvs.player.y / 16);
		if(bcvs.field.getGridFromIndex(x, y) > 0){
			// 移動
			this._dst = [x, y, r];
			if(this._arrow){bcvs.player.dstList = [this._dst];}
			else{bcvs.player.dstList = bcvs.pathFinder.getDstList(sx, sy, this._dst);}
			bcvs.player.motion = "walk";
		}else if(r != this._calcRotID(bcvs.player.r)){
			// 方向転換
			this._dst = [sx, sy, r];
			bcvs.player.dstList = [this._dst];
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

