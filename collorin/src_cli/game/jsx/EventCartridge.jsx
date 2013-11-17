import 'js.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベントカートリッジクラス 継承して使う
abstract class EventCartridge{
	// イベント処理 返値でtrueを返す間はイベントが続く
	abstract function calc() : boolean;
	// 直列イベントの処理
	static function serialEvent(list : EventCartridge[]) : void{
		while(list.length > 0){
			if(!list[0].calc()){list.splice(0,1);}
			else{break;}
		}
	}
	// 並列イベントの処理
	static function parallelEvent(list : EventCartridge[]) : void{
		for(var i = 0; i < list.length; i++){
			if(!list[i].calc()){list.splice(i--,1);}
		}
	}
}

// フレームウエイト
class ECwait extends EventCartridge{
	var _wait : int;
	// コンストラクタ
	function constructor(wait : int){
		this._wait = wait;
	}
	// 計算
	override function calc() : boolean{
		return this._wait-- >= 0;
	}
}

// 1フレームイベント
class ECone extends EventCartridge{
	var _func : function():void;
	// コンストラクタ
	function constructor(func : function():void){
		this._func = func;
	}
	// 計算
	override function calc() : boolean{
		this._func();
		return false;
	}
}

// 永続イベント
class ECfix extends EventCartridge{
	var _func : function():void;
	// コンストラクタ
	function constructor(func : function():void){
		this._func = func;
	}
	// 計算
	override function calc() : boolean{
		this._func();
		return true;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

