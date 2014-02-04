import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// socket.io.jsラッパクラス

native class SocketIOClient{
	static function connect(url : string) : SocketIOClientSocket;
} = '''{
	connect: io.connect
}''';

native class SocketIOClientSocket{
	function on(event : string, listener : function():void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant):void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant,arg1:variant):void) : SocketIOClientSocket;
	function on(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : SocketIOClientSocket;
	function emit(event : string) : boolean;
	function emit(event : string, arg0 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant) : boolean;
	function removeListener(event : string, listener : function():void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant):void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant):void) : SocketIOClientSocket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : SocketIOClientSocket;
	function removeAllListeners() : SocketIOClientSocket;
	function removeAllListeners(event : string) : SocketIOClientSocket;
	function disconnect() : SocketIOClientSocket;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

