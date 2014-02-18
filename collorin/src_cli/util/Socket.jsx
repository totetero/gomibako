import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native class SocketIOClient{
	static function connect(callback : function(socket:SocketIOClientSocket):void) : void;
} = """{
	connect: function(callback){
		var url = "http://" + document.domain + ":10081";
		var socketConnect = function(){
			var options = {"force new connection": true};
			var socket = window.io.connect(url, options);
			callback(socket);
		};
		if(!window.io){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url + "/socket.io/socket.io.js";
			script.onload = function(e){socketConnect();};
			document.head.appendChild(script);
		}else{
			socketConnect();
		}
	}
}""";

native class SocketIOClientSocket{
	function of(namespace : string) : SocketIOClientSocket;
	function on(event : string, listener : function():void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant):void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant,arg1:variant):void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : SocketIOClientSocket;
	function once(event : string, listener : function():void) : SocketIOClientSocket;
	function once(event : string, listener : function(arg0:variant):void) : SocketIOClientSocket;
	function once(event : string, listener : function(arg0:variant,arg1:variant):void) : SocketIOClientSocket;
	function once(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function():void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant):void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant):void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : SocketIOClientSocket;
	function removeAllListeners() : SocketIOClientSocket;
	function removeAllListeners(event : string) : SocketIOClientSocket;
	function emit(event : string) : boolean;
	function emit(event : string, arg0 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant) : boolean;
	function disconnect() : SocketIOClientSocket;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

