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

import "../core/data/chara/SECpopupDataChara.jsx";
import "PageChat.jsx";
import "SECchatPopupMenu.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットカートリッジ
class SECchatMain implements SerialEventCartridge{
	var _page : PageChat;
	var _btnList = {} : Map.<PartsButton>;
	var _arrowKey : boolean;

	var _ww : int;
	var _wh : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChat, response : variant){
		this._page = page;

		// ボタン作成
		this._btnList["send"] = new PartsButtonBasic("送信", -90, 10, 80, 30);
		this._btnList["menu"] = new PartsButtonBasic("メニュー", -90, -40, 80, 30);
		// テキストエリアリセット
		Ctrl.input.value = "";
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
		Ctrl.input.type = "text";
		Ctrl.input.maxLength = 16;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;
		bcvs.calcButton(this._btnList);

		// テキストエリア表示
		if(Ctrl.input.className != "textarea"){
			Ctrl.input.className = "textarea";
		}

		// グリッドタップ
		if(bcvs.gridTrigger != null){
			if(bcvs.player != null){
				// フィールド押下による移動
				var x = bcvs.gridTrigger[0];
				var y = bcvs.gridTrigger[1];
				var r = this._calcRotID(Math.atan2((y * 16 + 8) - bcvs.player.y, (x * 16 + 8) - bcvs.player.x));
				this._arrowKey = false;
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
			if(bcvs.player.dstList.length == 0 || !this._arrowKey){
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
					this._arrowKey = true;
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
			this._page.socket.sendSerif(Ctrl.input.value);
			Ctrl.input.value = "";
		}

		// メニューボタン
		if(this._btnList["menu"].trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECchatPopupMenu(this._page, this));
			return false;
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ウインドウサイズに対する位置調整
		if(this._ww != Ctrl.window.w || this._wh != Ctrl.window.h){
			this._ww = Ctrl.window.w;
			this._wh = Ctrl.window.h;
			Ctrl.input.style.left = (Ctrl.screen.x + Ctrl.screen.w - 310) + "px";
			Ctrl.input.style.top = (Ctrl.screen.y + 10) + "px";
			Ctrl.input.style.width = "210px";
			Ctrl.input.style.height = "30px";
		}
		for(var name in this._btnList){
			var btn = this._btnList[name];
			if(btn.basex < 0){btn.x = Ctrl.screen.w + btn.basex;}
			if(btn.basey < 0){btn.y = Ctrl.screen.h + btn.basey;}
		}

		// キャンバス描画
		this._page.bcvs.draw();

		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// ヘッダ描画
		this._page.header.draw();
	}

	// ----------------------------------------------------------------
	// プレイヤーの移動確認
	function _checkMove(x : int, y : int, r : int) : void{
		var bcvs = this._page.bcvs;
		var sx : int = Math.floor(bcvs.player.x / 16);
		var sy : int = Math.floor(bcvs.player.y / 16);
		if(bcvs.field.getGridFromIndex(x, y) > 0){
			// 移動
			var dst = this._page.socket.nextDst = [x, y, r];
			if(this._arrowKey){bcvs.player.dstList = [dst];}
			else{bcvs.player.dstList = bcvs.pathFinder.getDstList(sx, sy, dst);}
			bcvs.player.motion = "walk";
		}else if(r != this._calcRotID(bcvs.player.r)){
			// 方向転換
			var dst = this._page.socket.nextDst = [sx, sy, r];
			bcvs.player.dstList = [dst];
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
		Ctrl.input.blur();
		Ctrl.input.className = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

