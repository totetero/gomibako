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
	function emit(command : string, test : int) : void;
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
	static function init(name : string) : void{
		Socket.connect = false;
		Socket.playerId = "";
		Socket.users = {} : Map.<SocketUserData>;

		var script = dom.document.createElement("script") as HTMLScriptElement;
		script.type = "text/javascript";
		script.src = "/socket.io/socket.io.js";
		script.onload = function(e : Event):void{
			Socket.socket = js.eval("io.connect('/')") as __noconvert__ _socketio;

			// 接続
			Socket.socket.on("connect", function(){
				Socket.connect = true;
				Socket.socket.emit("entry", name);
				log "サーバに接続したよ";
			});

			// 通信切断
			Socket.socket.on("disconnect", function(){
				Socket.connect = false;
				log "サーバが落ちたよ";
			});

			// ゲーム情報獲得
			Socket.socket.on('entry', function(id : string, users : Map.<SocketUserData>){
				log "接続", users;
				Socket.users = users;
				Socket.playerId = id;
			});

			// ユーザー新規接続
			Socket.socket.on('add', function(id : string, name : string, x : number, y : number){
				log "新規 " + id + " " + name;
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
					user.serif = serif;
				}
			});

			// ユーザー退出
			Socket.socket.on('kill', function(id : string){
				var user = Socket.users[id];
				if(user){
					log "退出 " + id + " " + user.name;
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

