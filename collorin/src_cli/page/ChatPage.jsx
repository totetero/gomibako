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

class SECchatPageMain extends EventCartridge{
	var _page : ChatPage;
	var _input : HTMLInputElement;
	var _btnList = {} : Map.<PageButton>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : ChatPage){
		this._page = page;
		this._input = this._page.div.getElementsByTagName("input").item(0) as HTMLInputElement;
		this._btnList["btn"] = new PageButton(this._page.div.getElementsByClassName("btn").item(0) as HTMLDivElement);
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var clickable = true;
		for(var name in this._btnList){
			this._btnList[name].calc(!this._page.ccvs.mdn);
			clickable = clickable && !this._btnList[name].active;
		}
		this._page.ccvs.calcTouchCoordinate(clickable);
		this._page.ccvs.calcTouchRotate();
		this._page.ccvs.calcRotate(this._page.ccvs.rotv, Math.PI / 180 * 30, 1);

		// キャラクター計算
		for(var i = 0; i < this._page.ccvs.member.length; i++){
			this._page.ccvs.member[i].calc(this._page.ccvs);
			if(!this._page.ccvs.member[i].exist){this._page.ccvs.member.splice(i--,1);}
		}

		// カメラ位置をプレイヤーに
		if(this._page.ccvs.player != null){
			this._page.ccvs.cx -= (this._page.ccvs.cx - this._page.ccvs.player.x) * 0.1;
			this._page.ccvs.cy -= (this._page.ccvs.cy - this._page.ccvs.player.y) * 0.1;
		}

		// メッセージの投稿
		if(Ctrl.trigger_enter || this._btnList["btn"].trigger){
			Ctrl.trigger_enter = false;
			this._btnList["btn"].trigger = false;
			this._page.socket.sendSerif(this._input.value);
			this._input.value = "";
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
						ccvs.member[i].talk(serif as string);
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
		if(isPlayer){ccvs.member.push(ccvs.player = new ChatPlayer(this, ccvs, uinfo));} // プレイヤー追加
		else{ccvs.member.push(new ChatCharacter(ccvs, uinfo));} // キャラクター追加
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
	var player : ChatPlayer;
	var member = new ChatCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var pathFinder : ChatPathFinder;

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
		this.field.draw(this, this.cx, this.cy, this.mdn && !Ctrl.mmv);
		for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class ChatPlayer extends ChatCharacter{
	var _socket : ChatSocket;
	var _ccvs : ChatCanvas;
	var _mdn : boolean;
	var _arrow : boolean;
	var _socketCounter : int = 0;
	var _dst : int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(socket : ChatSocket, ccvs : ChatCanvas, charaInfo : variant){
		super(ccvs, charaInfo);
		this._socket = socket;
		this._ccvs = ccvs;
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
				var r = this._calcRotID(Math.atan2(ccvs.ty - this.y, ccvs.tx - this.x));
				this._arrow = false;
				this._checkMove(x, y, r);
			}
		}

		if(this.dstList.length == 0 || !this._arrow){
			// 十字キーでの移動
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
				var x = Math.floor(this.x / 16);
				var y = Math.floor(this.y / 16);
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

		// 一定間隔毎に位置の通信
		if((this._socketCounter++) % 30 == 0){
			this._socket.sendDestination(this._dst);
		}
	}

	// ----------------------------------------------------------------
	// 移動確認
	function _checkMove(x : int, y : int, r : int) : void{
		var sx : int = Math.floor(this.x / 16);
		var sy : int = Math.floor(this.y / 16);
		if(this._ccvs.field.getGridFromIndex(x, y) > 0){
			// 移動
			this._dst = [x, y, r];
			if(this._arrow){this.dstList = [this._dst];}
			else{this.dstList = this._ccvs.pathFinder.getDstList(sx, sy, this._dst);}
		}else if(r != this._calcRotID(this.r)){
			// 方向転換
			this._dst = [sx, sy, r];
			this.dstList = [this._dst];
		}
	}

	// ----------------------------------------------------------------
	// 角度を整数にする
	function _calcRotID(r : number) : int{
		r = 4 * r / Math.PI;
		while(r < 0){r += 8;}
		return Math.round(r) % 8;
	}
}

// キャラクタークラス
class ChatCharacter{
	var _character : DrawCharacter;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;
	var dstList = new int[][];
	var exist : boolean;
	var uid : int;
	var x : number;
	var y : number;
	var r : number;
	var action : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["code"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;
		this._character = new DrawCharacter(img, drawInfo, size);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);
		if(this._character.weapon){ccvs.clist.push(this._character.weapon);}
		this.exist = true;
		this.uid = charaInfo["uid"] as int;
		this.x = charaInfo["x"] as int * 16 + 8;
		this.y = charaInfo["y"] as int * 16 + 8;
		this.r = charaInfo["r"] as int * Math.PI * 0.25;
		this.talk(charaInfo["serif"] as string);
	}

	// ----------------------------------------------------------------
	// 会話
	function talk(message : string) : void{
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
		this._balloon.preDraw(ccvs, x, y, 35, 1.0);
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
		this._balloon.exist = false;
		this._shadow.exist = false;
		if(this._character.weapon){this._character.weapon.exist = false;}
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

