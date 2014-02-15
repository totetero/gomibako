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
		this.serialPush(new SECloadPage("/chat", null, function(response : variant) : void{
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
					this._page.serialCutting(new SECchatPagePopup(this._page, ccvs.member[this._tappedCharacter]));
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

		return true;
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
			<div class="name"></div>
			<div class="chara">キャラ画像</div>
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
		(this._window.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = this._chara.name as string;
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

// ソケット
class ChatSocket{
	var _socket : SocketIOClientSocket;
	var _socketof : SocketIOClientSocket;
	var _strayPacket = new variant[];
	var _sendDst : int[];
	var _sendSerif : string;

	// ----------------------------------------------------------------
	// 初期化
	function init(ccvs : ChatCanvas) : void{
		SocketIOClient.connect(function(socket : SocketIOClientSocket) : void{
			this._socket = socket;
			this._socketof = this._socket.of("chat");

			// ゲーム情報獲得
			this._socketof.on("entry", function(uid : variant, uinfoListData : variant, imgs : variant):void{
				Loader.loadImg(imgs as Map.<string>, function() : void{
					// 画像ロード完了
					var uinfoList = uinfoListData as variant[];
					for(var i = 0; i < uinfoList.length; i++){
						this._create(ccvs, uid, uinfoList[i]);
					}
				}, function():void{
					// 画像ロード失敗
				});
			});

			// ユーザー新規接続
			this._socketof.on("add", function(uinfo : variant, imgs : variant):void{
				Loader.loadImg(imgs as Map.<string>, function() : void{
					// 画像ロード完了
					this._create(ccvs, null, uinfo);
				}, function():void{
					// 画像ロード失敗
				});
			});

			// ユーザー位置更新
			this._socketof.on("walk", function(uid : variant, dst : variant):void{
				log "移動 " + uid as string + " " + dst[0] as string + " " + dst[1] as string + " " + dst[2] as string;
				var isUse = false;
				for(var i = 0; i < ccvs.member.length; i++){
					if(uid == ccvs.member[i].uid){
						var sx = Math.floor(ccvs.member[i].x / 16);
						var sy = Math.floor(ccvs.member[i].y / 16);
						ccvs.member[i].dstList = ccvs.pathFinder.getDstList(sx, sy, dst as int[]);
						isUse = true;
					}
				}
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "talk", dst: dst});}
			});

			// ユーザー台詞更新
			this._socketof.on("talk", function(uid : variant, serif : variant):void{
				log "発言 " + uid as string + " " + serif as string;
				var isUse = false;
				for(var i = 0; i < ccvs.member.length; i++){
					if(uid == ccvs.member[i].uid){
						ccvs.member[i].setTalk(serif as string);
						isUse = true;
					}
				}
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "talk", uid: uid, serif: serif});}
			});

			// ユーザー退出
			this._socketof.on("kill", function(uid : variant):void{
				log "退出 " + uid as string;
				var isUse = this._kill(ccvs, uid);
				// 迷子パケット
				if(!isUse){this._strayPacket.push({type: "kill", uid: uid});}
			});

			this._socketof.emit("entry");
		});
	}

	// ----------------------------------------------------------------
	// キャラクターを作成
	function _create(ccvs : ChatCanvas, uid : variant, uinfo : variant) : void{
		if(!this._strayPacketCheck(uinfo)){return;} // 迷子パケットの適用確認
		this._kill(ccvs, uinfo["uid"]); // uidが重複しているキャラクターがいたら除去
		var isPlayer = (uid == uinfo["uid"]);
		var type = (isPlayer ? "自分" : ((uid == null) ? "新規" : "継続"));
		log type + " " + uinfo["uid"] as string + " " + uinfo["serif"] as string;
		// キャラクター作成
		var character = new ChatCharacter(ccvs, uinfo);
		ccvs.member.push(character);
		if(isPlayer){ccvs.player = character;}
	}

	// ----------------------------------------------------------------
	// 指定したuidのキャラクターを除去
	function _kill(ccvs : ChatCanvas, uid : variant) : boolean{
		var isUse = false;
		for(var i = 0; i < ccvs.member.length; i++){
			if(uid == ccvs.member[i].uid){
				ccvs.member[i].dispose();
				ccvs.member.splice(i--, 1);
				isUse = true;
			}
		}
		return isUse;
	}

	// ----------------------------------------------------------------
	// 迷子パケットの適用確認
	function _strayPacketCheck(uinfo : variant) : boolean{
		var exist = true;
		for(var i = 0; i < this._strayPacket.length; i++){
			if(uinfo["uid"] == this._strayPacket[i]["uid"]){
				var type = this._strayPacket[i]["type"] as string;
				if(type == "walk"){
					// 移動
					uinfo["x"] = this._strayPacket[i]["dst"][0];
					uinfo["y"] = this._strayPacket[i]["dst"][1];
					uinfo["r"] = this._strayPacket[i]["dst"][2];
				}else if(type == "talk"){
					// 発言
					uinfo["serif"] = this._strayPacket[i]["serif"];
				}else if(type == "kill"){
					// 退出
					exist = false;
				}else{continue;}
				this._strayPacket.splice(i--, 1);
			}
		}
		return exist;
	}

	// ----------------------------------------------------------------
	// 位置送信
	function sendDestination(dst : int[]) : void{
		if(this._socket != null){
			if(this._sendDst != dst){
				this._sendDst = dst;
				this._socketof.emit("walk", dst);
			}
		}
	}

	// ----------------------------------------------------------------
	// 台詞送信
	function sendSerif(serif : string) : void{
		if(this._socket != null){
			if(this._sendSerif != serif){
				this._sendSerif = serif;
				this._socketof.emit("talk", serif);
			}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		if(this._socket != null){
			// ソケット切断
			this._socket.disconnect();
			this._socketof.removeAllListeners();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class ChatCanvas extends Ccvs{
	var field : GridField;
	var player : ChatCharacter;
	var member = new ChatCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var pathFinder : ChatPathFinder;
	var tapped : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement){
		super(canvas, 320, 480, Math.PI / 180 * 45, Math.PI / 180 * 45, 2);
	}

	// ----------------------------------------------------------------
	// 初期化
	function init(response : variant) : void{
		// フィールド
		this.field = new GridField(this, Loader.imgs["grid"], response["grid"] as int[][]);
		this.pathFinder = new ChatPathFinder(this.field);
		// 初期カメラ位置
		this.cx = (this.cxmax + this.cxmin) * 0.5;
		this.cy = (this.cymax + this.cymin) * 0.5;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, this.tapped);
		for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class ChatCharacter{
	var _character : DrawCharacter;
	var _nametag : DrawText;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;

	var uid : int;
	var name : string;

	var exist : boolean;
	var x : number;
	var y : number;
	var r : number;
	var action : int;
	var dstList = new int[][];

	var _color : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["code"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;

		this.uid = charaInfo["uid"] as int;
		this.name = charaInfo["name"] as string;
		this.x = charaInfo["x"] as int * 16 + 8;
		this.y = charaInfo["y"] as int * 16 + 8;
		this.r = charaInfo["r"] as int * Math.PI * 0.25;

		this._character = new DrawCharacter(img, drawInfo, size);
		this._nametag = new DrawText(this.name);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._nametag);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);

		this.exist = true;
		this.setTalk(charaInfo["serif"] as string);
	}

	// ----------------------------------------------------------------
	// 表示深度獲得
	function getDepth() : number{
		return this._character.drz;
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		if(this._color == color){return;}
		this._color = color;
		this._character.setColor(color);
	}

	// ----------------------------------------------------------------
	// 会話設定
	function setTalk(message : string) : void{
		this._balloon.setText(message, -1);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(ccvs : Ccvs) : void{
		if(this.dstList.length > 0){
			// グリッド目的地に向かう
			this.action++;
			var dx = this.dstList[0][0] * 16 + 8;
			var dy = this.dstList[0][1] * 16 + 8;
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = 3.0;
			if(x * x + y * y < speed * speed){
				this.x = dx;
				this.y = dy;
				if(this.dstList[0][2] >= 0){this.r = this.dstList[0][2] * Math.PI * 0.25;}
				this.dstList.shift();
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
		this._nametag.preDraw(ccvs, x, y, 40, 1.0);
		this._balloon.preDraw(ccvs, x, y, 50, 1.0);
		this._shadow.preDraw(ccvs, x, y, 0);
		if(this.dstList.length > 0){
			this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk"));
		}else{
			this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._nametag.exist = false;
		this._balloon.exist = false;
		this._shadow.exist = false;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 経路探索クラス
class ChatPathFinder{
	var _map : GridField;
	var _openList = new int[];
	var _parents = new int[];
	var _costs = new int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(map : GridField){
		this._map = map;
	}

	// ----------------------------------------------------------------
	// スタートノードのリセット
	function _snode(sx : int, sy : int) : void{
		// 全ノード初期化
		this._openList.length = 0;
		for(var i = 0; i < this._map.gridxsize * this._map.gridysize; i++){
			this._parents[i] = -1;
			this._costs[i] = 0;
		}
		// スタートノード登録
		var snode = this._map.gridxsize * sy + sx;
		this._parents[snode] = snode;
		this._openList.push(snode);
	}

	// ----------------------------------------------------------------
	// ゴールノードまでへの経路探索
	function _gnode(gx : int, gy : int) : void{
		// ゴールノード
		var gnode = this._map.gridxsize * gy + gx;
		// ダイクストラ法
		for(var loop = 0; loop < 9999; loop++){
			// openリストが空ならば終了
			if(this._openList.length == 0){break;}
			// openリストのうち最小コストのノードを取り出す
			var index = -1;
			var cnode = -1;
			var ccost = -1;
			for(var i = 0; i < this._openList.length; i++){
				if(i == 0 || this._costs[this._openList[i]] < ccost){
					index = i;
					cnode = this._openList[i];
					ccost = this._costs[cnode];
				}
			}
			// ゴールノードにたどり着いていたら終了
			if(cnode == gnode){break;}
			this._openList.splice(index, 1);
			// 隣接しているノードを調べる
			var cx : int = cnode % this._map.gridxsize;
			var cy : int = cnode / this._map.gridxsize;
			this._checkNode(cnode, cx + 1, cy);
			this._checkNode(cnode, cx - 1, cy);
			this._checkNode(cnode, cx, cy + 1);
			this._checkNode(cnode, cx, cy - 1);
			this._checkNode(cnode, cx + 1, cy + 1);
			this._checkNode(cnode, cx - 1, cy + 1);
			this._checkNode(cnode, cx + 1, cy - 1);
			this._checkNode(cnode, cx - 1, cy - 1);
		}
	}

	// ----------------------------------------------------------------
	// ノードへのコストを調べる
	function _checkNode(parent : int, tx : int, ty : int) : void{
		// マップチップの確認
		var mapchip = this._map.getGridFromIndex(tx, ty);
		if(mapchip <= 0){return;}
		// 既チェックの確認
		var tnode = this._map.gridxsize * ty + tx;
		if(this._parents[tnode] >= 0){return;}
		// コストの登録
		this._costs[tnode] = this._costs[parent] + 1;
		this._parents[tnode] = parent;
		this._openList.push(tnode);
	}

	// ----------------------------------------------------------------
	// 経路を調べる
	function getDstList(sx : int, sy : int, dst : int[]) : int[][]{
		var gx = dst[0];
		var gy = dst[1];
		this._snode(sx, sy);
		this._gnode(gx, gy);
		var node = this._map.gridxsize * gy + gx;
		var dstList = [dst];
		for(var i = 0; i < 9999; i++){
			if(this._costs[node] == 0){break;}
			var x : int = node % this._map.gridxsize;
			var y : int = node / this._map.gridxsize;
			dstList.unshift([x, y, -1]);
			node = this._parents[node];
		}
		return dstList;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

