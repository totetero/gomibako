import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native __fake__ class _socketio{
	function on(command : string, f : function():void) : void;
	function on(command : string, f : function(id : string, users : Map.<SocketUserData>):void) : void;
	function on(command : string, f : function(id : string, name : string, x : number, y : number):void) : void;
	function on(command : string, f : function(id : string, x : number, y : number):void) : void;
	function on(command : string, f : function(id : string, serif : string):void) : void;
	function on(command : string, f : function(id : string):void) : void;
	function emit(command : string, cookie : string, room : string) : void;
	function emit(command : string, x : number, y : number) : void;
	function emit(command : string, str : string) : void;
}

class SocketUserData{
	var name : string;
	var dstx : number;
	var dsty : number;
	var serif : string;
}

class Socket{
	static var socket : _socketio;
	static var connect : boolean;
	static var playerId : string;
	static var users : Map.<SocketUserData>;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Socket.connect = false;
		Socket.playerId = "";
		Socket.users = {} : Map.<SocketUserData>;

		// 発言ボックスDOM作成
		var nameDiv = dom.document.createElement("div") as HTMLDivElement;
		var textarea = dom.document.createElement("input") as HTMLInputElement;
		var button = dom.document.createElement("input") as HTMLInputElement;
		var formDiv = dom.document.createElement("div") as HTMLDivElement;
		nameDiv.style.display = "inline";
		textarea.type = "text";
		button.type = "button";
		button.value = "準備中";
		formDiv.style.position = "absolute";
		formDiv.style.left = "10px";
		formDiv.style.top = "10px";
		formDiv.appendChild(nameDiv);
		formDiv.appendChild(textarea);
		formDiv.appendChild(button);
		dom.document.body.appendChild(formDiv);

		// 通信設定
		var script = dom.document.createElement("script") as HTMLScriptElement;
		script.type = "text/javascript";
		script.src = "/socket.io/socket.io.js";
		script.onload = function(e : Event):void{
			Socket.socket = js.eval("io.connect('/')") as __noconvert__ _socketio;

			// 接続
			Socket.socket.on("connect", function(){
				Socket.connect = true;
				Socket.socket.emit("entry", dom.document.cookie, "room0");
				log "サーバに接続したよ";
			});

			// 通信切断
			Socket.socket.on("disconnect", function(){
				Socket.connect = false;
				log "サーバが落ちたよ";
			});

			// ゲーム情報獲得
			Socket.socket.on('entry', function(id : string, users : Map.<SocketUserData>){
				for(var uid in users){log ((id == uid) ? "自分 " : "継続 ") + users[uid].name + ": " + users[uid].serif;}

				Socket.users = users;
				Socket.playerId = id;
				// 発言ボタンの設定
				nameDiv.innerHTML = Socket.users[id].name;
				button.value = "発言";
				button.onclick = function(e : Event){
					if(textarea.value != Socket.users[Socket.playerId].serif){Socket.sendStr(textarea.value);}
					textarea.value = "";
				};
				// Enter入力で発言
				dom.document.addEventListener("keyup", function(e : Event){
					if((e as KeyboardEvent).keyCode == 13 && textarea.value != ""){
						if(textarea.value != Socket.users[Socket.playerId].serif){Socket.sendStr(textarea.value);}
						textarea.value = "";
					}else{
						textarea.focus();
					}
				}, true);
			});

			// ユーザー新規接続
			Socket.socket.on('add', function(id : string, name : string, x : number, y : number){
				log "新規 " + name + ": ";
				
				var user = new SocketUserData();
				user.name = name;
				user.dstx = x;
				user.dsty = y;
				user.serif = "";
				Socket.users[id] = user;
			});

			// ユーザー目的地更新
			Socket.socket.on('move', function(id : string, x : number, y : number){
				var user = Socket.users[id];
				if(user){
					user.dstx = x;
					user.dsty = y;
				}
			});

			// ユーザー台詞更新
			Socket.socket.on('talk', function(id : string, serif : string){
				var user = Socket.users[id];
				if(user){
					log "発言 " + user.name + ": " + serif;

					user.serif = serif;
				}
			});

			// ユーザー退出
			Socket.socket.on('kill', function(id : string){
				var user = Socket.users[id];
				if(user){
					log "退出 " + user.name + ": ";

					delete Socket.users[id];
				}
			});
		};
		dom.document.head.appendChild(script);
	}

	// ----------------------------------------------------------------
	// 目的地送信
	static function sendDst(x : number, y : number) : void{
		if(Socket.connect){
			Socket.socket.emit("dst", x, y);
		}
	}

	// ----------------------------------------------------------------
	// 台詞送信
	static function sendStr(str : string) : void{
		if(Socket.connect){
			Socket.socket.emit("str", str);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

