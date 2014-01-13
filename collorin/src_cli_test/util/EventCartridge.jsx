import 'js.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベントカートリッジクラス 継承して使う
abstract class EventCartridge{
	// 開始直前の初期化処理
	function init() : void{}
	// イベント処理 返値でtrueを返す間はイベントが続く
	function calc() : boolean{return false;}
	// 描画処理
	function draw() : void{}
	// 破棄処理
	function dispose() : void{}

	// --------------------------------
	static var _serialList : EventCartridge[] = new EventCartridge[];
	static var _parallelList : EventCartridge[] = new EventCartridge[];
	static var _serialCurrent : EventCartridge = null;
	static var _parallelNext : EventCartridge = null;
	// 直列イベントの設定
	static function serialPush(ec : EventCartridge) : void{
		EventCartridge._serialList.push(ec);
	}
	// 並列イベントの設定
	static function parallelPush(ec : EventCartridge) : void{
		EventCartridge._parallelList.push(ec);
		ec.init();
	}
	// 直列イベントの割り込み
	static function serialCutting(ec : EventCartridge) : void{
		if(EventCartridge._serialCurrent != null){
			EventCartridge._serialList.unshift(EventCartridge._serialCurrent);
			EventCartridge._serialCurrent = null;
		}
		EventCartridge._serialList.unshift(ec);
	}
	// イベントリセット準備
	static function reset(ec : EventCartridge) : void{
		EventCartridge._parallelNext = ec;
	}

	// --------------------------------
	// イベントの処理
	static function calcEvent() : void{
		// 直列イベントの処理
		EventCartridge._calcSerialEvent();

		// 並列イベントの処理
		for(var i = 0; i < EventCartridge._parallelList.length; i++){
			if(!EventCartridge._parallelList[i].calc()){
				EventCartridge._parallelList[i].dispose();
				EventCartridge._parallelList.splice(i--,1);
			}
		}

		// イベントリセット
		if(EventCartridge._parallelNext != null){
			if(EventCartridge._serialCurrent != null){EventCartridge._serialCurrent.dispose();}
			for(var i = 0; i < EventCartridge._serialList.length; i++){EventCartridge._serialList[i].dispose();}
			for(var i = 0; i < EventCartridge._parallelList.length; i++){EventCartridge._parallelList[i].dispose();}
			EventCartridge.parallelPush(EventCartridge._parallelNext);
			EventCartridge._serialCurrent = null;
			EventCartridge._parallelNext = null;
		}
	}
	// 直列イベントの処理関数
	static function _calcSerialEvent() : void{
		if(EventCartridge._serialCurrent != null && !EventCartridge._serialCurrent.calc()){
			EventCartridge._serialCurrent.dispose();
			EventCartridge._serialCurrent = null;
		}
		if(EventCartridge._serialCurrent == null){
			if(EventCartridge._serialList.length > 0){
				EventCartridge._serialCurrent = EventCartridge._serialList.shift();
				EventCartridge._serialCurrent.init();
				EventCartridge._calcSerialEvent();
			}
		}
	}

	// --------------------------------
	// イベントの描画
	static function drawEvent() : void{
		// 直列イベントの描画
		if(EventCartridge._serialCurrent != null){
			EventCartridge._serialCurrent.draw();
		}

		// 並列イベントの描画
		for(var i = 0; i < EventCartridge._parallelList.length; i++){
			EventCartridge._parallelList[i].draw();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 内部直列化イベントカートリッジ TODO 未使用未テスト
class SerializedEventCartridge extends EventCartridge{
	var _list : EventCartridge[];
	var _current : EventCartridge = null;
	// コンストラクタ
	function constructor(list : EventCartridge[]){
		this._list = list;
	}
	// 計算
	override function calc() : boolean{
		if(this._current != null && !this._current.calc()){
			this._current.dispose();
			this._current = null;
		}
		if(this._current == null){
			if(this._list.length > 0){
				this._current = this._list.shift();
				this._current.init();
				return this.calc();
			}
			return false;
		}
		return true;
	}
	// 描画
	override function draw() : void{
		if(this._current != null){
			this._current.draw();
		}
	}
}

// 内部平列化イベントカートリッジ TODO 未使用未テスト
class ParallelizedEventCartridge extends EventCartridge{
	var _list : EventCartridge[];
	// コンストラクタ
	function constructor(list : EventCartridge[]){
		this._list = list;
	}
	// 初期化
	override function init() : void{
		for(var i = 0; i < this._list.length; i++){
			this._list[i].init();
		}
	}
	// 計算
	override function calc() : boolean{
		for(var i = 0; i < this._list.length; i++){
			if(!this._list[i].calc()){
				this._list[i].dispose();
				this._list.splice(i--,1);
			}
		}
		return (this._list.length > 0);
	}
	// 描画
	override function draw() : void{
		for(var i = 0; i < this._list.length; i++){
			this._list[i].draw();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

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

