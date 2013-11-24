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

	// 直列イベントの設定
	static var serialList : EventCartridge[] = new EventCartridge[];
	static function serialPush(ec : EventCartridge) : void{EventCartridge.serialList.push(ec);}
	// 直列イベントの処理
	static var serialCurrent : EventCartridge = null;
	static function serialEvent() : void{
		if(EventCartridge.serialCurrent == null || !EventCartridge.serialCurrent.calc()){
			if(EventCartridge.serialList.length > 0){
				EventCartridge.serialCurrent = EventCartridge.serialList.shift();
				EventCartridge.serialCurrent.init();
				EventCartridge.serialEvent();
			}else{
				EventCartridge.serialCurrent = null;
			}
		}
	}
	// 直列イベントの割り込み
	static function serialCutting(ec : EventCartridge) : void{
		if(EventCartridge.serialCurrent != null){
			EventCartridge.serialList.unshift(EventCartridge.serialCurrent);
			EventCartridge.serialCurrent = null;
		}
		EventCartridge.serialList.unshift(ec);
	}

	// 並列イベントの設定
	static var parallelList : EventCartridge[] = new EventCartridge[];
	static function parallelPush(ec : EventCartridge) : void{EventCartridge.parallelList.push(ec);}
	// 並列イベントの処理
	static function parallelEvent() : void{
		for(var i = 0; i < EventCartridge.parallelList.length; i++){
			if(!EventCartridge.parallelList[i].calc()){EventCartridge.parallelList.splice(i--,1);}
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

