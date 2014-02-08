import "nodejs.jsx";

native class SocketIO {
	static function listen(port : int) : SocketManager;
	static function listen(server : HTTPServer) : SocketManager;
} = "require('socket.io') ";

native class SocketManager{
	__readonly__ var sockets : SocketNamespace;
	function of(namespace : string) : SocketNamespace;
	function set(key : string, value : variant) : SocketManager;
	function enable(key : string) : SocketManager;
	function configure(callback : function():void) : SocketManager;
} = "require('socket.io').Manager";

native class SocketNamespace{
	function on(event : string, callback: function(socket:Socket):void): void;
	function to(room : string) : SocketNamespace;
	function emit(event : string, arg0 : variant, arg1 : variant) : void;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant) : void;
}

native class Socket{
	var id : string;
	function on(event : string, listener : function():void) : void;
	function on(event : string, listener : function(arg0:variant):void) : void;
	function on(event : string, listener : function(arg0:variant,arg1:variant):void) : void;
	function on(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : void;
	function emit(event : string) : void;
	function emit(event : string, arg0 : variant) : void;
	function emit(event : string, arg0 : variant, arg1 : variant) : void;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant, arg3 : variant, arg4 : variant) : void;
	function to(room : string) : Socket;
	function join(name : string) : Socket;
	function leave(name : string) : Socket;
	var broadcast : Socket;
	var volatile : Socket;
	var json : Socket;
	function disconnect() : Socket;
} = "require('socket.io').Socket";

native class SocketUtil{
	static function parse1(cookie : string) : Map.<string>;
	static function parse2(cookie : string, key : string) : string;
} = '''{
	parse1: require("express/node_modules/cookie").parse,
	parse2: require("express/node_modules/connect").utils.parseSignedCookie,
}''';

native class SocketRedisStore{
	function constructor();
	function constructor(options : variant);
} = 'require("socket.io/lib/stores/redis")';

