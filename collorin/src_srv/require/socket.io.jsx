import "nodejs.jsx";
import "express.jsx";
import "../models/User.jsx";

native class SocketIO {
	static function listen(port : int) : SocketManager;
	static function listen(server : HttpServer) : SocketManager;
} = "require('socket.io') ";

native class SocketManager{
	__readonly__ var sockets : SocketNamespace;
	function of(namespace : string) : SocketNamespace;
	function set(key : string, value : variant) : SocketManager;
	function enable(key : string) : SocketManager;
	function configure(callback : function():void) : SocketManager;
} = "require('socket.io').Manager";

native class SocketNamespace{
	function on(event : string, callback: function(socket:Socket):void): SocketNamespace;
	function emit(event : string) : boolean;
	function emit(event : string, arg0 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant) : boolean;
	function to(room : string) : SocketNamespace;
}

native class Socket{
	var id : string;
	var handshake : SocketHandshake;
	function on(event : string, listener : function():void) : Socket;
	function on(event : string, listener : function(arg0:variant):void) : Socket;
	function on(event : string, listener : function(arg0:variant,arg1:variant):void) : Socket;
	function on(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : Socket;
	function once(event : string, listener : function():void) : Socket;
	function once(event : string, listener : function(arg0:variant):void) : Socket;
	function once(event : string, listener : function(arg0:variant,arg1:variant):void) : Socket;
	function once(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : Socket;
	function removeListener(event : string, listener : function():void) : Socket;
	function removeListener(event : string, listener : function(arg0:variant):void) : Socket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant):void) : Socket;
	function removeListener(event : string, listener : function(arg0:variant,arg1:variant,arg2:variant):void) : Socket;
	function removeAllListeners() : Socket;
	function removeAllListeners(event : string) : Socket;
	function emit(event : string) : boolean;
	function emit(event : string, arg0 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant) : boolean;
	function emit(event : string, arg0 : variant, arg1 : variant, arg2 : variant) : boolean;
	function to(room : string) : Socket;
	function join(name : string) : Socket;
	function leave(name : string) : Socket;
	var broadcast : Socket;
	var volatile : Socket;
	var json : Socket;
	function disconnect() : Socket;
} = "require('socket.io').Socket";

native class SocketHandshake{
	var headers : variant;
	var session : ExSession;
	var user : UserModel;
}

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

