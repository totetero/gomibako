import 'js.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベントカートリッジクラス 継承して使う
abstract class EventCartridge{
	// イベント処理 返値でtrueを返す間はイベントが続く
	abstract function calc() : boolean;
	// 直列イベント用 開始直前の初期化処理
	function init() : void{}
	// 直列イベント用 描画処理
	function draw() : void{}

	// 直列イベントの処理
	static var serialCurrent : EventCartridge = null; 
	static function serialEvent(list : EventCartridge[]) : void{
		if(EventCartridge.serialCurrent == null || !EventCartridge.serialCurrent.calc()){
			if(list.length > 0){
				EventCartridge.serialCurrent = list.shift();
				EventCartridge.serialCurrent.init();
				EventCartridge.serialEvent(list);
			}else{
				EventCartridge.serialCurrent = null;
			}
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

