import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native __fake__ class _socketio{
	function on(command : string, f : function():void) : void;
	function emit(command : string, test : int) : void;
}

class Socket{
	static var socket : _socketio;
	static var connect : boolean;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Socket.connect = false;

		var script = dom.document.createElement("script") as HTMLScriptElement;
		script.type = "text/javascript";
		script.src = "/socket.io/socket.io.js";
		script.onload = function(e : Event):void{
			Socket.socket = js.eval("io.connect('/')") as __noconvert__ _socketio;

			// 接続
			Socket.socket.on('connect', function(){
				Socket.connect = true;
				Socket.socket.emit("hoge", 0);
				log "サーバに接続したよ";
			});

			// 切断
			Socket.socket.on('disconnect', function(){
				Socket.connect = false;
				log "サーバが落ちたよ";
			});
		};
		dom.document.head.appendChild(script);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

