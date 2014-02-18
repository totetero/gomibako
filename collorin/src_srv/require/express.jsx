import "nodejs.jsx";
import "../models/User.jsx";

native class express{
	static function create() : ExApplication;
	static function logger(env : string) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function json(options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function urlencoded() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function methodOverride() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function cookieParser() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function session(options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function compress() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function static_(path : string) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function errorHandler(options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
} = """{
	create: require("express"),
	logger: require("express").logger,
	json: require("express").json,
	urlencoded: require("express").urlencoded,
	methodOverride: require("express").methodOverride,
	cookieParser: require("express").cookieParser,
	session: require("express").session,
	compress: require("express").compress,
	static_: require("express").static,
	errorHandler: require("express").errorHandler,
}""";

native class ExApplication{
	function set(name : string, value : variant) : void;
	function get(name : string) : variant;
	function enable(name : string) : void;
	function disable(name : string) : void;
	function enabled(name : string) : boolean;
	function disabled(name : string) : boolean;
	function configure(env : string, callback : function():void) : void;
	function configure(callback : function():void) : void;
	function use(callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function all(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function get(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	function post(path : string, ...callback : function(req:ExRequest,res:ExResponse,next:function():void):void) : void;
	var router : function(req:ExRequest,res:ExResponse,next:function():void) : void;
}

native class ExRequest{
	var url : string;
	var params : variant;
	var body : variant;
	var session : ExSession;
	var user : UserModel;
	function logout() : void;
	function isAuthenticated() : boolean;
}

native class ExResponse{
	function status(code : int) : ExResponse;
	function redirect(url : string) : ExResponse;
	function send(body : string) : ExResponse;
	function send(body : Buffer) : ExResponse;
	function render(path : string) : ExResponse;
	function render(path : string, options : variant) : ExResponse;
	function contentType(type : string) : ExResponse;
}

native class ExSession{
	var passport : Map.<string>;
}

