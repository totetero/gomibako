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
	var player : ChatCharacter;
	var clist : DrawUnit[] = new DrawUnit[];
	var slist : DrawUnit[] = new DrawUnit[];

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
		// ソケット
		this.socket = new ChatSocket();

		// イベント設定
		this.serialPush(new SECloadPage("/chat", null, function(response : variant) : void{
			// フィールド
			this.field = new GridField(this.ccvs, Loader.imgs["grid"], response["grid"] as int[][]);
			// キャラクター
			this.player = new ChatCharacter(this, response["charaInfo"]);
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
		if(this.player != null){this.player.preDraw(this.ccvs);}
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

		if(!this._page.player.isMoving){
			var r = 0;
			if     (Ctrl.krt && Ctrl.kup){r = 7 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.klt && Ctrl.kup){r = 5 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.klt && Ctrl.kdn){r = 3 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.krt && Ctrl.kdn){r = 1 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.krt){r = 0 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.kup){r = 6 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.klt){r = 4 - 8 * this.ccvs.rotv / Math.PI;}
			else if(Ctrl.kdn){r = 2 - 8 * this.ccvs.rotv / Math.PI;}
			else{}
			while(r < 0){r += 8;}
			while(r >= 8){r -= 8;}
			log Math.round(r);
		}

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

		if(Ctrl.trigger_cb){
			Ctrl.trigger_cb = false;
			this._page.player.move(Math.floor(10 * Math.random()), Math.floor(10 * Math.random()));
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
	var isMoving : boolean;

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
		this.isMoving = (this._dstList.length > 0);
		if(this.isMoving){
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
		if(this.isMoving){
			this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk"));
		}else{
			this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

