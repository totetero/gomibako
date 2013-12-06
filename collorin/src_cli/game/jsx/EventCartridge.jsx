import 'js.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベントカートリッジクラス 継承して使う
abstract class EventCartridge{
	// 直列イベント用 開始直前の初期化処理
	function init() : void{}
	// イベント処理 返値でtrueを返す間はイベントが続く
	function calc() : boolean{return false;}
	// 描画処理
	function draw() : void{}

	// 直列イベントの設定
	static var _serialList : EventCartridge[] = new EventCartridge[];
	static var _serialCurrent : EventCartridge = null;
	static function serialPush(ec : EventCartridge) : void{EventCartridge._serialList.push(ec);}
	// 直列イベントの割り込み
	static function serialCutting(ec : EventCartridge) : void{
		if(EventCartridge._serialCurrent != null){
			EventCartridge._serialList.unshift(EventCartridge._serialCurrent);
			EventCartridge._serialCurrent = null;
		}
		EventCartridge._serialList.unshift(ec);
	}
	// 直列イベントの処理
	static function serialEvent() : void{
		if(EventCartridge._serialCurrent == null || !EventCartridge._serialCurrent.calc()){
			if(EventCartridge._serialList.length > 0){
				EventCartridge._serialCurrent = EventCartridge._serialList.shift();
				EventCartridge._serialCurrent.init();
				EventCartridge.serialEvent();
			}else{
				EventCartridge._serialCurrent = null;
			}
		}
	}
	// 直列イベントの描画
	static function serialDraw() : void{
		if(EventCartridge._serialCurrent != null){
			EventCartridge._serialCurrent.draw();
		}
	}

	// 並列イベントの設定
	static var _parallelList : EventCartridge[] = new EventCartridge[];
	static function parallelPush(ec : EventCartridge) : void{EventCartridge._parallelList.push(ec);}
	// 並列イベントの処理
	static function parallelEvent() : void{
		for(var i = 0; i < EventCartridge._parallelList.length; i++){
			if(!EventCartridge._parallelList[i].calc()){EventCartridge._parallelList.splice(i--,1);}
		}
	}
	// 並列イベントの描画
	static function parallelDraw() : void{
		for(var i = 0; i < EventCartridge._parallelList.length; i++){
			EventCartridge._parallelList[i].draw();
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

