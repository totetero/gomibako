
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 直列イベントカートリッジインターフェイス
interface SerialEventCartridge{
	// 開始直前の初期化
	abstract function init() : void;
	// 計算 返値でtrueを返す間はイベントが続く
	abstract function calc() : boolean;
	// 描画
	abstract function draw() : void;
	// 破棄
	abstract function dispose() : void;
}

// 並列イベントカートリッジインターフェイス
interface ParallelEventCartridge{
	// 開始直前の初期化
	abstract function init() : void;
	// 計算 返値でtrueを返す間はイベントが続く
	abstract function calc() : boolean;
	// 破棄
	abstract function dispose() : void;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// イベント再生クラス
class EventPlayer{
	var _serialCurrent : SerialEventCartridge = null;
	var _serialList = new SerialEventCartridge[];
	var _parallelList = new ParallelEventCartridge[];

	// --------------------------------
	// イベントの設定

	// 直列イベントの追加
	function serialPush(sec : SerialEventCartridge) : void{
		this._serialList.push(sec);
	}

	// 並列イベントの追加
	function parallelPush(pec : ParallelEventCartridge) : void{
		pec.init();
		this._parallelList.push(pec);
	}

	// --------------------------------
	// イベントの確認

//	// 現在の直列イベント確認
//	function getSerialCurrent() : SerialEventCartridge{
//		return this._serialCurrent;
//	}
//
	// 次の直列イベント確認
	function getSerialNext() : SerialEventCartridge{
		return this._serialList.length > 0 ? this._serialList[0] : null;
	}

	// --------------------------------
	// イベントの計算
	function calc() : boolean{
		// 直列イベントの計算処理
		this._calcSerial();
		// 並列イベントの計算処理
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
	function _calcSerial() : void{
		if(this._serialCurrent != null && !this._serialCurrent.calc()){
			this._serialCurrent.dispose();
			this._serialCurrent = null;
		}
		if(this._serialCurrent == null){
			if(this._serialList.length > 0){
				this._serialCurrent = this._serialList.shift();
				this._serialCurrent.init();
				this._calcSerial();
			}
		}
	}

	// --------------------------------
	// イベントの描画
	function draw() : void{
		if(this._serialCurrent != null){this._serialCurrent.draw();}
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

