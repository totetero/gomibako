import "nodejs.jsx";

native class express{
	static function create() : ExApplication;
	static function json(options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function static_(path : string) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
} = """{
	create: require("express"),
	json: require('body-parser').json,
	static_: require("express").static,
}""";

native class ExApplication{
	function set(name : string, value : variant) : void;
	function use(callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function all(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function get(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function post(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
}

native class ExRequest{
	var query : variant;
	var body : variant;
	var headers : variant;
}

native class ExResponse{
	function status(code : int) : ExResponse;
	function send(body : string) : ExResponse;
	function send(body : Buffer) : ExResponse;
	function render(path : string) : ExResponse;
	function setHeader(name : string, value : string) : ExResponse;
}

