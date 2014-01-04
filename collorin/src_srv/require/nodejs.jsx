import "express.jsx";

// ----------------------------------------------------------------

native class node{
	static const __dirname : string;
} = '''{
	__dirname: __dirname,
}''';

// ----------------------------------------------------------------

native class process{
	static function nextTick(callback : function():void) : void;
}

// ----------------------------------------------------------------

native class Buffer {
	function toString(encoding : string) : string;
}

// ----------------------------------------------------------------

native class http{
	static function Server(app : ExApplication) : HTTPServer;
} = 'require("http")';

native class HTTPServer{
	function listen(port : int) : void;
}

// ----------------------------------------------------------------

native class fs {
	static function readFile(filename : string, callback : function(err:variant,data:Buffer):void) : void;
	static function readFile(filename : string, encoding : string, callback : function(err:variant,data:string):void) : void;
} = "require('fs')";

// ----------------------------------------------------------------

native class crypto{
	static function createHmac(algorithm : string, key : string) : Hmac;
} = 'require("crypto")';

native class Hmac{
	function update(data : string) : Hmac;
	function digest(encoding : string) : string;
}

// ----------------------------------------------------------------

