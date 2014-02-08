import "express.jsx";

native class redis{
	static function createClient(port : int, host : string, options : variant) : RedisClient;
} = 'require("redis")';

native class RedisClient{
	function set(key : string, val : string) : void;
	function get(key : string, callback : function(err:variant,val:string):void) : void;
}

native class RedisStore{
	function constructor();
	function constructor(options : variant);
	function get(sid : string, callback : function(err:variant,session:ExSession):void) : void;
} = 'require("connect-redis")(require("express"))';

