
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
}

// イベント再生クラス
class EventPlayer{
	var _serialCurrent : EventCartridge = null;
	var _serialList : EventCartridge[] = new EventCartridge[];
	var _parallelList : EventCartridge[] = new EventCartridge[];
	var _disposeList : EventCartridge[] = new EventCartridge[];

	// --------------------------------
	// イベントの設定

	// 直列イベントの追加
	function serialPush(sec : EventCartridge) : void{
		this._serialList.push(sec);
	}

	// 並列イベントの追加
	function parallelPush(pec : EventCartridge) : void{
		this._parallelList.push(pec);
		pec.init();
	}

	// 直列イベントの割り込み
	function serialCutting(sec : EventCartridge) : void{
		if(this._serialCurrent != null){
			this._serialList.unshift(this._serialCurrent);
			this._serialCurrent = null;
		}
		this._serialList.unshift(sec);
	}

	// --------------------------------
	// イベントの処理
	function calcEvent() : boolean{
		// 使い終わっている要素の破棄
		for(var i = 0; i < this._disposeList.length; i++){this._disposeList[i].dispose();}
		this._disposeList.length = 0;
		// 直列イベントの処理
		var serialExist = this.calcSerialEvent();
		// 並列イベントの処理
		for(var i = 0; i < this._parallelList.length; i++){
			if(!this._parallelList[i].calc()){
				this._disposeList.push(this._parallelList[i]);
				this._parallelList.splice(i--,1);
			}
		}
		return serialExist || this._parallelList.length > 0;
	}
	// 直列イベントの処理 再帰関数
	function calcSerialEvent() : boolean{
		if(this._serialCurrent != null && !this._serialCurrent.calc()){
			this._disposeList.push(this._serialCurrent);
			this._serialCurrent = null;
		}
		if(this._serialCurrent == null){
			if(this._serialList.length > 0){
				this._serialCurrent = this._serialList.shift();
				this._serialCurrent.init();
				return this.calcSerialEvent();
			}
			return false;
		}
		return true;
	}

	// --------------------------------
	// イベントの描画
	function drawEvent() : void{
		// 直列イベントの描画
		if(this._serialCurrent != null){
			this._serialCurrent.draw();
		}
		// 並列イベントの描画
		for(var i = 0; i < this._parallelList.length; i++){
			this._parallelList[i].draw();
		}
	}

	// --------------------------------
	// イベントの破棄
	function dispose() : void{
		if(this._serialCurrent != null){
			this._serialCurrent.dispose();
			this._serialCurrent = null;
		}
		for(var i = 0; i < this._serialList.length; i++){this._serialList[i].dispose();}
		for(var i = 0; i < this._parallelList.length; i++){this._parallelList[i].dispose();}
		for(var i = 0; i < this._disposeList.length; i++){this._disposeList[i].dispose();}
		this._serialList.length = 0;
		this._parallelList.length = 0;
		this._disposeList.length = 0;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 内部直列化イベントカートリッジ
class SerializedEventCartridge extends EventCartridge{
	var _player : EventPlayer = null;
	// コンストラクタ
	function constructor(list : EventCartridge[]){
		this._player = new EventPlayer();
		for(var i = 0; i < list.length; i++){
			this._player.serialPush(list[i]);
		}
	}
	// 計算
	override function calc() : boolean{
		return this._player.calcEvent();
	}
	// 描画
	override function draw() : void{
		this._player.drawEvent();
	}
	// 破棄
	override function dispose() : void{
		this._player.dispose();
	}
}

// 内部平列化イベントカートリッジ
class ParallelizedEventCartridge extends EventCartridge{
	var _player : EventPlayer = null;
	// コンストラクタ
	function constructor(list : EventCartridge[]){
		this._player = new EventPlayer();
		for(var i = 0; i < list.length; i++){
			this._player.parallelPush(list[i]);
		}
	}
	// 計算
	override function calc() : boolean{
		return this._player.calcEvent();
	}
	// 描画
	override function draw() : void{
		this._player.drawEvent();
	}
	// 破棄
	override function dispose() : void{
		this._player.dispose();
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

