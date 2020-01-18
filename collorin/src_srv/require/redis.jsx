import "express.jsx";

native class redis{
	static function createClient(port : int, host : string, options : variant) : RedisClient;
} = """require("redis")""";

native class RedisClient{
	function set(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function get(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function getset(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function del(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function incr(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function keys(value : string[], callback : function(err:variant,results:string[]):void) : void;

	function sadd(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function srem(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function scard(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function smembers(value : string[], callback : function(err:variant,results:string[]):void) : void;

	function hset(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function hget(value : string[], callback : function(err:variant,result:Nullable.<string>):void) : void;
	function hmset(key : string, json : variant, callback : function(err:variant,result:Nullable.<string>):void) : void;
	function hmget(key : string, field : string[], callback : function(err:variant,results:string[]):void) : void;
	function hkeys(key : string, callback : function(err:variant,results:string[]):void) : void;
	function hvals(key : string, callback : function(err:variant,results:string[]):void) : void;
	function hgetall(key : string, callback : function(err:variant,results:variant):void) : void;
}

native class RedisStore{
	function constructor();
	function constructor(options : variant);
	function get(sid : string, callback : function(err:variant,session:ExSession):void) : void;
} = """require("connect-redis")(require("express"))""";
