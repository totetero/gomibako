native class mongoose{
	static function connect(str : string) : void;
	static var connections : variant;
} = 'require("mongoose")';

native class mongooseModel{
	var _id: string;
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
}

native class MongoStore{
	function constructor(options : variant);
	function get(sid : string, callback : function(err:variant,session:variant):void) : void;
} = 'require("connect-mongo")(require("express"))';

