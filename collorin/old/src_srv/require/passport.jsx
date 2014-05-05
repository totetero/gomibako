import "express.jsx";
import "../models/User.jsx";

native class passport{
	static function initialize() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function session() : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function serializeUser(fn : function(user:UserModel,done:function(err:variant,id:string):void):void) : void;
	static function deserializeUser(fn : function(id:string,done:function(err:variant,user:UserModel):void):void) : void;
	static function use(strategy : LocalStrategy) : void;
	static function use(strategy : TwitterStrategy) : void;
	static function authenticate(strategy : string) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
	static function authenticate(strategy : string, options : variant) : function(req:ExRequest,res:ExResponse,next:function():void) : void;
} = """require("passport")""";

native class LocalStrategy{
	function constructor(
		options : variant,
		verify : function(
			username:string,
			password:string,
			verified:function(err:variant,user:UserModel,info:variant):void
		):void
	);
} = """require("passport-local").Strategy""";

native class TwitterStrategy{
	function constructor(
		options : variant,
		verify : function(
			token:string,
			tokenSecret:string,
			profile:TwitterProfile,
			verified:function(err:variant,user:UserModel,info:variant):void
		):void
	);
} = """require("passport-twitter").Strategy""";

native class TwitterProfile{
	var id : string;
	var username : string;
	var displayName : string;
	var _json : variant;
}

