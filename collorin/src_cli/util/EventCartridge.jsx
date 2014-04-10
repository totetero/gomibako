
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベントカートリッジクラス 継承して使う
abstract class EventCartridge{
	// 開始直前の初期化
	function init() : void{}
	// 計算 返値でtrueを返す間はイベントが続く
	function calc() : boolean{return false;}
	// 破棄
	function dispose() : void{}
}

// イベント再生クラス
class EventPlayer{
	var _serialCurrent : EventCartridge = null;
	var _serialList = new EventCartridge[];
	var _parallelList = new EventCartridge[];

	// --------------------------------
	// イベントの設定

	// 直列イベントの追加
	function serialPush(sec : EventCartridge) : void{
		this._serialList.push(sec);
	}

	// 並列イベントの追加
	function parallelPush(pec : EventCartridge) : void{
		pec.init();
		this._parallelList.push(pec);
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
	function calc() : boolean{
		// 直列イベントの処理
		this.calcSerial();
		// 並列イベントの処理
		for(var i = 0; i < this._parallelList.length; i++){
			if(!this._parallelList[i].calc()){
				this._parallelList[i].dispose();
				this._parallelList.splice(i--, 1);
			}
		}
		// イベントの存在確認
		return this._serialCurrent != null || this._parallelList.length > 0;
	}
	// 直列イベントの処理 再帰関数
	function calcSerial() : void{
		if(this._serialCurrent != null && !this._serialCurrent.calc()){
			this._serialCurrent.dispose();
			this._serialCurrent = null;
		}
		if(this._serialCurrent == null){
			if(this._serialList.length > 0){
				this._serialCurrent = this._serialList.shift();
				this._serialCurrent.init();
				this.calcSerial();
			}
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
		this._serialList.length = 0;
		this._parallelList.length = 0;
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

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

