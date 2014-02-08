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
		<input type="text">
		<div class="btn">送信</div>
	""";

	// チャットソケット
	var socket : ChatSocket;
	// キャンバス
	var ccvs : ChatCanvas;

	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "チャット";
		this.depth = 3;
		this.headerType = 0;
		this.lctrlType = 1;
		this.rctrlType = 0;
	}

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
		this.serialPush(new SECloadPage("/chat", null, function(response : variant) : void{
			// データの形成
			this.ccvs.init(response);
		}));
		this.serialPush(new ECdrawOne(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECchatPageMain(this));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
		this.socket.dispose();
	}
}

class SECchatPageMain extends SECctrlCanvas{ // TODO 継承をやめたい
	var _page : ChatPage;
	var _input : HTMLInputElement;
	var _btnList = {} : Map.<PageButton>;

	// コンストラクタ
	function constructor(page : ChatPage){
		super(page.ccvs, 1);
		this._page = page;
		this._input = this._page.div.getElementsByTagName("input").item(0) as HTMLInputElement;
		this._btnList["btn"] = new PageButton(this._page.div.getElementsByClassName("btn").item(0) as HTMLDivElement);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		var clickable = true;
		for(var name in this._btnList){
			this._btnList[name].calc(!this.ccvs.mdn);
			clickable = clickable && !this._btnList[name].active;
		}
		this.ccvs.calc(clickable);

		super.calc();

		this._page.ccvs.player.calc(this.ccvs);
		this.ccvs.cx -= (this.ccvs.cx - this._page.ccvs.player.x) * 0.1;
		this.ccvs.cy -= (this.ccvs.cy - this._page.ccvs.player.y) * 0.1;

		// メッセージの投稿
		if(Ctrl.trigger_enter || this._btnList["btn"].trigger){
			Ctrl.trigger_enter = false;
			this._btnList["btn"].trigger = false;
			this._page.ccvs.player.talk(this._input.value);
			this._input.value = "";
		}

		return true;
	}

	// 描画
	override function draw() : void{
		this._page.ccvs.draw();
		for(var name in this._btnList){this._btnList[name].draw();}
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ソケット
class ChatSocket{
	var _socket : SocketIOClientSocket;

	// コンストラクタ
	function constructor(){
		SocketIOClient.connect("chat", function(socket : SocketIOClientSocket) : void{
			this._socket = socket;
			this._socket.on("hoge", function():void{log "socket!!";});
			this._socket.emit("test");
		});
	}

	// 破棄
	function dispose() : void{
		if(this._socket != null){
			// ソケット切断
			this._socket.disconnect();
			this._socket.removeAllListeners();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class ChatCanvas extends Ccvs{
	var field : GridField;
	var player : ChatPlayer;
	var friend = new ChatCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];

	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement){
		super(320, 480, canvas);
		this.scale = 2;
		this.rotv = Math.PI / 180 * 45;
		this.sinv = Math.sin(this.rotv);
		this.cosv = Math.cos(this.rotv);
	}

	// ----------------------------------------------------------------
	// 初期化
	function init(response : variant) : void{
		// フィールド
		this.field = new GridField(this, Loader.imgs["grid"], response["grid"] as int[][]);
		// キャラクター
		this.player = new ChatPlayer(this, response["charaInfo"]);
		this.friend.push(new ChatCharacter(this, response["charaInfo"]));
		// 初期カメラ位置
		this.cx = (this.cxmax + this.cxmin) * 0.5;
		this.cy = (this.cymax + this.cymin) * 0.5;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, this.mdn && !Ctrl.mmv);
		this.player.preDraw(this);
		for(var i = 0; i < this.friend.length; i++){this.friend[i].preDraw(this);}
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class ChatPlayer extends ChatCharacter{
	var _ccvs : ChatCanvas;
	var _mdn : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		super(ccvs, charaInfo);
		this._ccvs = ccvs;
	}

	// ----------------------------------------------------------------
	// 移動
	function ctrlMove(x : int, y : int) : void{
		if(this._ccvs.field.getGridFromIndex(x, y) > 0){
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
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["id"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);
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

