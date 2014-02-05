import "js/web.jsx";

import "../util/Loader.jsx";
import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "../util/Socket.jsx";
import "../bb3d/Ccvs.jsx";
import "../bb3d/Character.jsx";
import "../bb3d/GridField.jsx";
import "Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class ChatPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
	""";

	// チャットソケット
	var socket : ChatSocket;
	// キャンバス情報
	var ccvs : Ccvs;
	// キャラクター
	var field : GridField;
	var player : ChatPlayer;
	var friend = new ChatCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];

	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "チャット";
		this.depth = 3;
		this.headerType = 0;
		this.lctrlType = 1;
		this.rctrlType = 1;
	}

	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chat";
		this.div.innerHTML = this._htmlTag;
		// キャンバス
		this.ccvs = new Ccvs(320, 480, this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);
		this.ccvs.scale = 2;
		this.ccvs.rotv = Math.PI / 180 * 45;
		this.ccvs.sinv = Math.sin(this.ccvs.rotv);
		this.ccvs.cosv = Math.cos(this.ccvs.rotv);
		// ソケット
		this.socket = new ChatSocket();

		// イベント設定
		this.serialPush(new SECloadPage("/chat", null, function(response : variant) : void{
			// フィールド
			this.field = new GridField(this.ccvs, Loader.imgs["grid"], response["grid"] as int[][]);
			// キャラクター
			this.player = new ChatPlayer(this, response["charaInfo"]);
			this.friend.push(new ChatCharacter(this, response["charaInfo"]));
		}));
		this.serialPush(new ECdrawOne(function() : void{
			// 初期描画
			this.ccvs.cx = (this.ccvs.cxmax + this.ccvs.cxmin) * 0.5;
			this.ccvs.cy = (this.ccvs.cymax + this.ccvs.cymin) * 0.5;
			this.canvasDraw();
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECchatPageMain(this));
	}

	// キャンバス描画
	function canvasDraw() : void{
		this.ccvs.context.clearRect(0, 0, this.ccvs.width, this.ccvs.height);
		this.field.draw(this.ccvs, this.ccvs.cx, this.ccvs.cy, Ctrl.mdn && !Ctrl.mmv);
		this.player.preDraw(this.ccvs);
		for(var i = 0; i < this.friend.length; i++){this.friend[i].preDraw(this.ccvs);}
		DrawUnit.drawList(this.ccvs, this.slist);
		DrawUnit.drawList(this.ccvs, this.clist);
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
		this.socket.dispose();
	}
}

class SECchatPageMain extends SECctrlCanvas{
	var _page : ChatPage;

	// コンストラクタ
	function constructor(page : ChatPage){
		super(page.ccvs, 1);
		this._page = page;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		super.calc();
		this._page.player.calc(this.ccvs);
		this.ccvs.cx -= (this.ccvs.cx - this._page.player.x) * 0.1;
		this.ccvs.cy -= (this.ccvs.cy - this._page.player.y) * 0.1;

		if(Ctrl.trigger_zb){
			Ctrl.trigger_zb = false;
			this._page.player.talk("キツネ大好き");
		}

		if(Ctrl.trigger_xb){
			Ctrl.trigger_xb = false;
			this._page.player.talk("");
		}

		return true;
	}

	// 描画
	override function draw() : void{
		this._page.canvasDraw();
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class ChatSocket{
	// ソケット
	var _socket : SocketIOClientSocket;

	// コンストラクタ
	function constructor(){
		this._socket = SocketIOClient.connect("/chat");
		this._socket.on("hoge", function():void{log "socket!!";});
		this._socket.emit("test");
	}

	// 破棄
	function dispose() : void{
		// ソケット切断
		this._socket.disconnect();
		this._socket.removeAllListeners();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class ChatPlayer extends ChatCharacter{
	var _page : ChatPage;
	var _mdn : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, charaInfo : variant){
		super(page, charaInfo);
		this._page = page;
	}

	// ----------------------------------------------------------------
	// 移動
	function ctrlMove(x : int, y : int) : void{
		if(this._page.field.getGridFromIndex(x, y) > 0){
			this._dstList.length = 0;
			this._dstList.push([x, y]);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc(ccvs : Ccvs) : void{
		super.calc(ccvs);

		if(this._mdn != ccvs.mdn){
			this._mdn = ccvs.mdn;
			if(!this._mdn && !Ctrl.mmv){
				// 画面クリックでの移動
				var x = Math.floor(ccvs.tx / 16);
				var y = Math.floor(ccvs.ty / 16);
				this.ctrlMove(x, y);
			}
		}

		if(this._dstList.length == 0){
			// 十字キーでの移動
			var r = 0;
			var isMove = true;
			if     (Ctrl.krt && Ctrl.kup){r = 7 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.klt && Ctrl.kup){r = 5 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.klt && Ctrl.kdn){r = 3 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.krt && Ctrl.kdn){r = 1 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.krt){r = 0 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.kup){r = 6 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.klt){r = 4 - 4 * ccvs.rotv / Math.PI;}
			else if(Ctrl.kdn){r = 2 - 4 * ccvs.rotv / Math.PI;}
			else{isMove = false;}
			if(isMove){
				var x = Math.floor(this.x / 16);
				var y = Math.floor(this.y / 16);
				while(r < 0){r += 8;}
				switch(Math.round(r) % 8){
					case 0: this.ctrlMove(x + 1, y + 0); break;
					case 1: this.ctrlMove(x + 1, y + 1); break;
					case 2: this.ctrlMove(x + 0, y + 1); break;
					case 3: this.ctrlMove(x - 1, y + 1); break;
					case 4: this.ctrlMove(x - 1, y + 0); break;
					case 5: this.ctrlMove(x - 1, y - 1); break;
					case 6: this.ctrlMove(x + 0, y - 1); break;
					case 7: this.ctrlMove(x + 1, y - 1); break;
				}
			}
		}
	}
}

// キャラクタークラス
class ChatCharacter{
	var _character : DrawCharacter;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;
	var _dstList = new int[][];
	var x : number;
	var y : number;
	var r : number;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage, charaInfo : variant){
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		this._character = new DrawCharacter(Loader.imgs["dot_" + charaInfo["id"] as string], drawInfo, size);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		page.clist.push(this._character);
		page.clist.push(this._balloon);
		page.slist.push(this._shadow);
		this.x = charaInfo["x"] as number;
		this.y = charaInfo["y"] as number;
		this.r = charaInfo["r"] as number;
	}

	// ----------------------------------------------------------------
	// 移動
	function move(x : int, y : int) : void{
		this._dstList.push([x, y]);
	}

	// ----------------------------------------------------------------
	// 会話
	function talk(message : string) : void{
		this._balloon.setText(message, -1);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(ccvs : Ccvs) : void{
		if(this._dstList.length > 0){
			// グリッド目的地に向かう
			this.action++;
			var dx = this._dstList[0][0] * 16 + 8;
			var dy = this._dstList[0][1] * 16 + 8;
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = 3.0;
			if(x * x + y * y < speed * speed){
				this.x = dx;
				this.y = dy;
				this._dstList.shift();
			}else{
				this.r = Math.atan2(y, x);
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs) : void{
		var x = this.x - ccvs.cx;
		var y = this.y - ccvs.cy;
		this._balloon.preDraw(ccvs, x, y, 35, 1.0);
		this._shadow.preDraw(ccvs, x, y, 0);
		if(this._dstList.length > 0){
			this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk"));
		}else{
			this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

