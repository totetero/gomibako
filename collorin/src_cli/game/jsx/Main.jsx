import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'Status.jsx';
import 'Message.jsx';
import 'EventCartridge.jsx';
import 'Game.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	// 画像リスト
	static var imgs : Map.<HTMLImageElement>;
	static var b64imgs : Map.<string>;

	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var jdat = js.global["jdat"] as variant;
		// タグ生成
		dom.document.getElementById("root").innerHTML = jdat["strs"]["mainTag"] as string;
		// 画像準備
		Main.imgs = {} : Map.<HTMLImageElement>;
		Main.b64imgs = {} : Map.<string>;
		Main.regImg(jdat["imgs"] as Map.<string>, function(){
			delete jdat["imgs"];
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
		Message.init();
		EventCartridge.parallelPush(new ECbackGround());
		EventCartridge.parallelPush(new ECtitle());
		// ループ開始
		Main.mainloop();
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		Ctrl.calc();
		Message.calc();
		// イベント処理
		EventCartridge.serialEvent();
		EventCartridge.parallelEvent();
		// 描画処理
		Cbtn.draw();
		Message.draw();
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
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(Ctrl.mdn){
			EventCartridge.parallelPush(new ECgame());
			return false;
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
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

