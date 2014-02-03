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
	function on(event : string, listener : function():void) : void;
	function on(event : string, listener : function(arg0:variant):void) : void;
	function on(event : string, listener : function(arg0:variant,arg1:variant):void) : void;
	function on(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : void;
	function emit(event : string) : void;
	function emit(event : string, arg0 : variant) : void;
	function emit(event : string, arg0 : variant, arg1 : variant) : void;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant, arg3 : variant, arg4 : variant) : void;
	//function close() : SocketIOClientSocket;
	//function disconnect() : SocketIOClientSocket;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

