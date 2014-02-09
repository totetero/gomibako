import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native class SocketIOClient{
	static function connect(namespace : string, callback : function(socket:SocketIOClientSocket):void) : void;
} = '''{
	connect: function(namespace, callback){
		var url = "http://" + document.domain + ":10081";
		if(!window.io){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url + "/socket.io/socket.io.js";
			script.onload = function(e){callback(window.io.connect(url + "/" + namespace));}
			document.head.appendChild(script);
		}else{
			callback(window.io.connect(url + "/" + namespace));
		}
	}
}''';

native class SocketIOClientSocket{
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

