native class RedisStore{
	function constructor();
	function constructor(options : variant);
	function get(sid : string, callback : function(err:variant,session:variant):void) : void;
} = 'require("connect-redis")(require("express"))';

