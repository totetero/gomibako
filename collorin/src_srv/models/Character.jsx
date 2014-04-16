native class CharaBaseModel{
	var _id: string;
	var name: string;
	var charaCode: string;
	var imageCode: string;
	var drawInfoCode: string;
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:CharaBaseModel[]):void) : void;
	static function findById(id : string, callback : function(err:variant,model:CharaBaseModel):void) : void;
} = """require("mongoose").model("CharaBase", new require("mongoose").Schema({
	name: {type: String},
	charaCode: {type: String},
	imageCode: {type: String},
	drawInfoCode: {type: String},
}))""";

native class CharaDataModel{
	var _id: string;
	var userId: string;
	var charaCode: string;
	var level: int;
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:CharaDataModel[]):void) : void;
	static function findById(id : string, callback : function(err:variant,model:CharaDataModel):void) : void;
} = """require("mongoose").model("CharaData", new require("mongoose").Schema({
	userId: {type: String},
	charaCode: {type: String},
	level: {type: Number},
}))""";


