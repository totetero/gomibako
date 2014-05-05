import "express.jsx";

// ----------------------------------------------------------------

native class node{
	static const __dirname : string;
} = """{
	__dirname: __dirname,
}""";

// ----------------------------------------------------------------

native class Buffer{
	var length : int;
	function constructor(size : int);
	function constructor(str : string, encoding : string);
	function toString(encoding : string) : string;
	function copy(targetBuffer : Buffer, targetStart : int) : void;
	function copy(targetBuffer : Buffer, targetStart : int, sourceStart : int, sourceEnd : int) : void;
	function readUInt8(offset : int) : int;
	function writeUInt8(value : int, offset : int) : void;
}

// ----------------------------------------------------------------

native class http{
	static function Server(app : ExApplication) : HttpServer;
} = """require("http")""";

native class HttpServer{
	function listen(port : int) : void;
}
// ----------------------------------------------------------------

native class fs{
	static function readFile(filename : string, callback : function(err:variant,data:Buffer):void) : void;
	static function readFile(filename : string, encoding : string, callback : function(err:variant,data:string):void) : void;
} = """require("fs")""";

// ----------------------------------------------------------------

native class crypto{
	static function getCiphers() : string[];
	static function getHashes() : string[];
	static function createHmac(algorithm : string, key : string) : Hmac;
	static function createCipher(algorithm : string, password : string) : Chipher;
	static function createDecipher(algorithm : string, password : string) : Dechipher;
} = """require("crypto")""";

native class Hmac{
	function update(data : string) : Hmac;
	function digest(encoding : string) : string;
}

native class Chipher{
	function update(data : string, input_encoding : string, output_encoding : string) : string;
	function final(encoding : string) : string;
}

native class Dechipher{
	function update(data : string, input_encoding : string, output_encoding : string) : string;
	function final(encoding : string) : string;
}

// ----------------------------------------------------------------

