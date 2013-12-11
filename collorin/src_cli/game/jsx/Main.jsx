import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'Status.jsx';
import 'Sound.jsx';
import 'EventCartridge.jsx';
import 'Game.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	// サーバから受け取ったjsonデータ
	static var jdat : variant;
	// 画像リスト
	static var imgs : Map.<HTMLImageElement>;
	static var b64imgs : Map.<string>;

	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		Main.jdat = js.global["jdat"] as variant;
		delete js.global["jdat"];
		// タグ生成
		dom.document.getElementById("root").innerHTML = Main.jdat["strs"]["mainTag"] as string;
		// 画像準備
		Main.imgs = {} : Map.<HTMLImageElement>;
		Main.b64imgs = {} : Map.<string>;
		Main.regImg(Main.jdat["imgs"] as Map.<string>, function(){
			delete Main.jdat["imgs"];
			// 初期化
			Main.init();
			// ローディング表記除去
			dom.document.body.removeChild(dom.document.getElementById("loading"));
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Ctrl.init();
		Status.init();
		Sound.init("/sound/bgm/bgm_stagebgm_07_hq.m4a");
		EventCartridge.parallelPush(new ECbackGround());
		EventCartridge.parallelPush(new ECtitle());
		// ループ開始
		Main.mainloop();
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		Ctrl.calc();
		// イベント処理
		EventCartridge.serialEvent();
		EventCartridge.parallelEvent();
		// 描画処理
		EventCartridge.serialDraw();
		EventCartridge.parallelDraw();
		// 次のフレームへ
		Timer.setTimeout(Main.mainloop, 33);
	}

	// ----------------------------------------------------------------
	// base64情報配列から画像登録
	static function regImg(b64imgs : Map.<string>, callback : function():void) : void{
		var count = 0;
		for(var i in b64imgs){count++;}
		if(count > 0){
			for(var i in b64imgs){
				if(i.search(/^b64_/) == 0){
					// css用画像
					Main.b64imgs[i.substring(4)] = b64imgs[i];
					if(--count == 0){callback();}
				}else{
					// canvas用画像
					var img = dom.createElement("img") as HTMLImageElement;
					img.onload = function(e : Event){
						// すべての登録が終わったらコールバック
						if(--count == 0){callback();}
					};
					img.src = b64imgs[i];
					Main.imgs[i] = img;
				}
			}
		}else{
			callback();
		}
	}

	// ----------------------------------------------------------------
	// XMLhttpリクエスト送信
	static function loadxhr(url : string, request : string, successFunc : function(:string):void, failureFunc : function():void) : void{
		// リクエスト開始準備
		var xhr = new XMLHttpRequest();
		if(request != ""){xhr.open("POST", url, true);}else{xhr.open("GET", url, true);}
		// リクエスト正常終了
		xhr.addEventListener("load", function(e : Event) : void{successFunc(xhr.responseText);});
		// リクエスト失敗
		xhr.addEventListener("abort", function(e : Event) : void{log "abort"; failureFunc();});
		xhr.addEventListener("error", function(e : Event) : void{log "error"; failureFunc();});
		xhr.addEventListener("timeout", function(e : Event) : void{log "timeout"; failureFunc();});
		// 通信開始
		xhr.send(request);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// タイトルクラス
class ECtitle extends EventCartridge{
	var _div : HTMLDivElement;
	var _startBtn : HTMLDivElement;
	var _soundBtn : HTMLDivElement;
	var _exitBtn : HTMLDivElement;
	var _mupfn : function(:Event):void;

	var _exist : boolean = true;
	var _button : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// DOM獲得
		this._div = dom.document.getElementsByClassName("jsx_ectitle title").item(0) as HTMLDivElement;
		this._startBtn = this._div.getElementsByClassName("btn start").item(0) as HTMLDivElement;
		this._soundBtn = this._div.getElementsByClassName("btn sound").item(0) as HTMLDivElement;
		this._exitBtn = this._div.getElementsByClassName("btn exit").item(0) as HTMLDivElement;

		// ステージ名
		this._div.getElementsByClassName("caption").item(0).innerHTML = Main.jdat["stagename"] as string;

		// サウンドボタン
		this._soundBtn.innerHTML = Sound.playing ? "サウンドON" : "サウンドOFF";
		// マウスを離す サウンド再生は機種によってタッチしないと受け付けないのでイベントリスナーで処理する
		this._mupfn = function(e : Event) : void{
			var btn = Math.abs(this._button);
			if(btn == 101){
				// スタートボタン処理
				Sound.setPlayable();
				this._exist = false;
			}else if(btn == 102){
				// サウンドボタン処理
				Sound.toggle();
				this._soundBtn.innerHTML = Sound.playing ? "サウンドON" : "サウンドOFF";
			}else if(btn == 103){
				// 中断ボタン処理
				dom.document.location.href = "/exit";
			}
		};
		// イベントリスナー登録
		if(Ctrl.isTouch){Ctrl.div.addEventListener("touchend", this._mupfn, true);}
		else{Ctrl.div.addEventListener("mouseup", this._mupfn, true);}
	}

	// 破棄
	function _dispose() : boolean{
		// イベントリスナー除去
		if(Ctrl.isTouch){Ctrl.div.removeEventListener("touchend", this._mupfn, true);}
		else{Ctrl.div.removeEventListener("mouseup", this._mupfn, true);}
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this._exist){
			// ボタン範囲の確認
			var btnid = 1;
			var b1 = this._startBtn.getBoundingClientRect();
			var b2 = this._soundBtn.getBoundingClientRect();
			var b3 = this._exitBtn.getBoundingClientRect();
			if(b1.left < Ctrl.mx && Ctrl.mx < b1.right && b1.top < Ctrl.my && Ctrl.my < b1.bottom){btnid = 101;}
			else if(b2.left < Ctrl.mx && Ctrl.mx < b2.right && b2.top < Ctrl.my && Ctrl.my < b2.bottom){btnid = 102;}
			else if(b3.left < Ctrl.mx && Ctrl.mx < b3.right && b3.top < Ctrl.my && Ctrl.my < b3.bottom){btnid = 103;}
			// 一通りの端末で動作確認するまでコメントとして残しておく
			//if(60 < Ccvs.mx && Ccvs.mx < 260){
			//	if(110 < Ccvs.my && Ccvs.my < 140){btnid = 101;}
			//	else if(180 < Ccvs.my && Ccvs.my < 210){btnid = 102;}
			//	else if(250 < Ccvs.my && Ccvs.my < 280){btnid = 103;}
			//}

			// ボタン押下状態の確認
			if(!Ctrl.mdn){btnid = 1;}
			if(Math.abs(this._button) != btnid){this._button = btnid;}
			return true;
		}else{
			// タイトルを閉じてゲームを開始する
			Ctrl.div.removeChild(this._div);
			EventCartridge.parallelPush(new ECgame());
			return this._dispose();
		}
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ボタン押下状態の描画
		if(this._button > 0){
			this._startBtn.className = (this._button == 101) ? "btn start hover" : "btn start";
			this._soundBtn.className = (this._button == 102) ? "btn sound hover" : "btn sound";
			this._exitBtn.className = (this._button == 103) ? "btn exit hover" : "btn exit";
			this._button *= -1;
		}
	}
}

// 背景クラス
class ECbackGround extends EventCartridge{
	var img : HTMLImageElement;
	var div0 : HTMLDivElement;
	var div1 : HTMLDivElement;
	var div2 : HTMLDivElement;
	var canvas : HTMLCanvasElement;
	var context : CanvasRenderingContext2D;
	var ww : int = 0;
	var wh : int = 0;
	var action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// DOM獲得
		this.div0 = dom.document.getElementsByClassName("jsx_ecbackground background").item(0) as HTMLDivElement;
		this.div1 = this.div0.getElementsByClassName("skycolor").item(0) as HTMLDivElement;
		this.div2 = this.div0.getElementsByClassName("groundcolor").item(0) as HTMLDivElement;
		// canvas作成
		this.img = Main.imgs["background"];
		this.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.div0.appendChild(this.canvas);
		// 空の色と大地の色を獲得
		this.canvas.width = 1;
		this.canvas.height = this.img.height;
		this.context.drawImage(this.img, 0, 0);
		var imgdat1 = this.context.getImageData(0, 0, 1, 1).data;
		var imgdat2 = this.context.getImageData(0, this.canvas.height - 1, 1, 1).data;
		this.div1.style.backgroundColor = "rgb(" + imgdat1[0] + "," + imgdat1[1] + "," + imgdat1[2] + ")";
		this.div2.style.backgroundColor = "rgb(" + imgdat2[0] + "," + imgdat2[1] + "," + imgdat2[2] + ")";
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this.action++;
		if(this.ww != Ctrl.ww){
			// 画面横幅が変わったらcanvasを作り直して横幅をそろえる
			this.ww = Ctrl.ww;
			this.wh = 0;
			this.div0.removeChild(this.canvas);
			this.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
			this.canvas.width = this.ww;
			this.canvas.height = this.img.height;
			this.div0.appendChild(this.canvas);
		}
		if(this.wh != Ctrl.wh){
			// 画面縦幅が変わったらcanvasの位置を調整する
			this.wh = Ctrl.wh;
			this.canvas.style.top = ((this.wh - this.canvas.height) * 0.5) + "px";
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// ループする背景
		var imgw = this.img.width;
		var pos = this.action % imgw;
		var num = Math.ceil(this.ww / this.img.width) + 1;
		for(var i = 0; i < num; i++){
			this.context.drawImage(this.img, imgw * (i - 1) + pos, 0);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

