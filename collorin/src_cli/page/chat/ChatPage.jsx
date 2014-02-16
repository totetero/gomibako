import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../Page.jsx";

import "ChatCanvas.jsx";
import "ChatSocket.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページクラス
class ChatPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
		<input type="text" maxlength="20">
		<div class="core-btn send">送信</div>
		<div class="core-btn exit">退出</div>
		<div class="core-popup"></div>
	""";

	// チャットソケット
	var socket : ChatSocket;
	// キャンバス
	var ccvs : ChatCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "チャット";
		this.depth = 3;
		this.headerType = 0;
		this.lctrlType = 1;
		this.rctrlType = 0;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chat";
		this.div.innerHTML = this._htmlTag;
		// ソケット
		this.socket = new ChatSocket();
		// キャンバス
		this.ccvs = new ChatCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// イベント設定
		this.serialPush(new SECloadPage("/chat", {"stage": "test"}, function(response : variant) : void{
			// データの形成
			this.ccvs.init(response);
			this.socket.init(this.ccvs);
		}));
		this.serialPush(new ECdrawOne(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECchatPageMain(this));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
		this.socket.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページメインイベントカートリッジ
class SECchatPageMain extends EventCartridge{
	var _page : ChatPage;
	var _input : HTMLInputElement;
	var _btnList = {} : Map.<PageButton>;

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
	override function init() : void{
		this._input = this._page.div.getElementsByTagName("input").item(0) as HTMLInputElement;
		this._btnList["send"] = new PageButton(this._page.div.getElementsByClassName("core-btn send").item(0) as HTMLDivElement, true);
		this._btnList["exit"] = new PageButton(this._page.div.getElementsByClassName("core-btn exit").item(0) as HTMLDivElement, true);
		this._page.ccvs.trigger_mup = false;
		Ctrl.trigger_enter = false;
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

		// キャンバス座標回転と押下確認
		ccvs.calcTouchCoordinate(clickable);
		ccvs.calcTouchRotate();
		ccvs.calcRotate(ccvs.rotv, Math.PI / 180 * 30, 1);

		// キャラクター計算
		for(var i = 0; i < ccvs.member.length; i++){
			ccvs.member[i].calc(ccvs);
			if(!ccvs.member[i].exist){ccvs.member.splice(i--,1);}
		}

		if(ccvs.player != null){
			// カメラ位置をプレイヤーに
			ccvs.cx -= (ccvs.cx - ccvs.player.x) * 0.1;
			ccvs.cy -= (ccvs.cy - ccvs.player.y) * 0.1;

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

		// キャラクターフィールド押下確認
		if(ccvs.trigger_mup){
			ccvs.trigger_mup = false;
			if(!Ctrl.mmv){
				if(this._tappedCharacter < 0){
					if(ccvs.player != null){
						// フィールド押下による移動
						var x = Math.floor(ccvs.tx / 16);
						var y = Math.floor(ccvs.ty / 16);
						var r = this._calcRotID(Math.atan2(ccvs.ty - ccvs.player.y, ccvs.tx - ccvs.player.x));
						this._arrow = false;
						this._checkMove(x, y, r);
					}
				}else{
					// キャラクター押下によるポップアップ表示
					this._page.serialPush(new SECchatPagePopup(this._page, ccvs.member[this._tappedCharacter]));
					exist = false;
				}
			}
		}

		// メッセージの投稿
		if(Ctrl.trigger_enter || this._btnList["send"].trigger){
			Ctrl.trigger_enter = false;
			this._btnList["send"].trigger = false;
			this._page.socket.sendSerif(this._input.value);
			this._input.value = "";
		}

		// 退出ボタン
		if(this._btnList["exit"].trigger){
			Page.transitionsPage("world");
		}

		// キャラクタータップ確認
		if(ccvs.mdn && !Ctrl.mmv){
			var index = -1;
			var depth = 0;
			for(var i = 0; i < ccvs.member.length; i++){
				var cdepth = ccvs.member[i].getDepth();
				if(index < 0 || depth < cdepth){
					var x0 = ccvs.member[i].x - ccvs.cx;
					var y0 = ccvs.member[i].y - ccvs.cy;
					var x1 = ccvs.width * 0.5 + (x0 * ccvs.cosv + y0 * -ccvs.sinv) * ccvs.scale;
					var y1 = ccvs.height * 0.5 + (x0 * ccvs.sinv + y0 * ccvs.cosv) * (ccvs.scale * ccvs.sinh);
					if(x1 - 15 < ccvs.mx && ccvs.mx < x1 + 15 && y1 - 25 < ccvs.my && ccvs.my < y1 + 5){
						depth = cdepth;
						this._tappedCharacter = index = i;
					}
				}
			}
		}else{
			this._tappedCharacter = -1;
		}

		// キャラクター描画設定
		for(var i = 0; i < ccvs.member.length; i++){ccvs.member[i].setColor((this._tappedCharacter == i) ? "rgba(255, 255, 255, 0.5)" : "");}
		// フィールド描画設定
		ccvs.tapped = (ccvs.mdn && !Ctrl.mmv && this._tappedCharacter < 0);

		// 一定間隔毎に位置の通信
		if((this._socketCounter++) % 30 == 0){
			this._page.socket.sendDestination(this._dst);
		}

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
	// 描画
	override function draw() : void{
		this._page.ccvs.draw();
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// チャットページポップアップイベントカートリッジ
class SECchatPagePopup extends EventCartridge{
	// HTMLタグ
	var _htmlTag = """
		<div class="core-background"></div>
		<div class="core-window">
			<div class="sidebar"></div>
			<div class="name"></div>
			<div class="chara"></div>
			<div class="core-btn close">閉じる</div>
		</div>
	""";

	var _page : ChatPage;
	var _chara : ChatCharacter;
	var _popup : HTMLDivElement;
	var _window : HTMLDivElement;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, chara : ChatCharacter){
		this._page = page;
		this._chara = chara;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this._popup = this._page.div.getElementsByClassName("core-popup").item(0) as HTMLDivElement;
		this._popup.innerHTML = this._htmlTag;
		this._window = this._popup.getElementsByClassName("core-window").item(0) as HTMLDivElement;
		(this._window.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._chara.name;
		(this._window.getElementsByClassName("chara").item(0) as HTMLDivElement).style.backgroundImage = "url(" + this._chara.bust + ")";
		this._btnList["close"] = new PageButton(this._window.getElementsByClassName("core-btn close").item(0) as HTMLDivElement, true);
		this._btnList["outer"] = new PageButton(this._window, false);
		Ctrl.trigger_mup = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;

		// ボタン押下確認
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// キャンバス座標回転と押下確認
		ccvs.calcTouchCoordinate(false);
		ccvs.calcTouchRotate();
		ccvs.calcRotate(ccvs.rotv, Math.PI / 180 * 30, 1);

		// キャラクター計算
		for(var i = 0; i < ccvs.member.length; i++){
			ccvs.member[i].calc(ccvs);
			if(!ccvs.member[i].exist){ccvs.member.splice(i--,1);}
		}

		if(ccvs.player != null){
			// カメラ位置をプレイヤーに
			ccvs.cx -= (ccvs.cx - ccvs.player.x) * 0.1;
			ccvs.cy -= (ccvs.cy - ccvs.player.y) * 0.1;
		}

		// 閉じるボタン
		if(this._btnList["close"].trigger || this._btnList["outer"].trigger){
			this._page.serialPush(new SECchatPageMain(this._page));
			return false;
		}

		return true;
	}


	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.ccvs.draw();
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._popup.innerHTML = "";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

