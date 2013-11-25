import 'js.jsx';
import 'js/web.jsx';
import 'timer.jsx';

import 'Ctrl.jsx';
import 'EventCartridge.jsx';
import 'Game.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	// 画像リスト
	static var imgs : Map.<HTMLImageElement>;

	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var jdat = js.global["jdat"] as variant;
		// 画像準備
		Main.imgs = {} : Map.<HTMLImageElement>;
		Main.regImg(jdat["imgs"] as Map.<string>, function(){
			delete jdat["imgs"];
			// 初期化
			Main.init();
			// メインループ開始
			Main.mainloop();
			// ローディング表記除去
			dom.document.body.removeChild(dom.document.getElementById("loading"));
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		BackGround.init();
		Ctrl.init();
		Cbtn.init();
		Ccvs.init();
		Game.init();
	}

	// ----------------------------------------------------------------
	// mainloop関数
	static function mainloop() : void{
		BackGround.calc();
		Ctrl.calc();
		Cbtn.calc();
		Ccvs.calc();
		// イベント処理
		EventCartridge.serialEvent();
		EventCartridge.parallelEvent();
		// 描画処理
		BackGround.draw();
		Cbtn.draw();
		Game.draw();
		EventCartridge.serialDraw();
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
				var img = dom.createElement("img") as HTMLImageElement;
				img.onload = function(e : Event){
					// すべての登録が終わったらコールバック
					if(--count == 0){callback();}
				};
				img.src = b64imgs[i];
				Main.imgs[i] = img;
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

// 背景クラス
class BackGround{
	static var img : HTMLImageElement;
	static var div0 : HTMLDivElement;
	static var div1 : HTMLDivElement;
	static var div2 : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	static var ww : int = 0;
	static var wh : int = 0;
	static var action : int = 0;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// canvas 作成
		BackGround.img = Main.imgs["background"];
		BackGround.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		BackGround.context = BackGround.canvas.getContext("2d") as CanvasRenderingContext2D;
		// 空の色と大地の色を獲得
		BackGround.canvas.width = 1;
		BackGround.canvas.height = BackGround.img.height;
		BackGround.context.drawImage(BackGround.img, 0, 0);
		var imgdat1 = BackGround.context.getImageData(0, 0, 1, 1).data;
		var imgdat2 = BackGround.context.getImageData(0, BackGround.canvas.height - 1, 1, 1).data;
		var color1 = "rgb(" + imgdat1[0] + "," + imgdat1[1] + "," + imgdat1[2] + ")";
		var color2 = "rgb(" + imgdat2[0] + "," + imgdat2[1] + "," + imgdat2[2] + ")";
		// div作成
		BackGround.div0 = dom.document.createElement("div") as HTMLDivElement;
		BackGround.div0.className = "background";
		BackGround.div1 = dom.document.createElement("div") as HTMLDivElement;
		BackGround.div1.className = "skycolor";
		BackGround.div1.style.backgroundColor = color1;
		BackGround.div2 = dom.document.createElement("div") as HTMLDivElement;
		BackGround.div2.className = "groundcolor";
		BackGround.div2.style.backgroundColor = color2;
		// DOM登録
		BackGround.div0.appendChild(BackGround.div1);
		BackGround.div0.appendChild(BackGround.div2);
		BackGround.div0.appendChild(BackGround.canvas);
		dom.document.body.appendChild(BackGround.div0);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		BackGround.action++;
		if(BackGround.ww != Ctrl.ww){
			// 画面横幅が変わったらcanvasを作り直して横幅をそろえる
			BackGround.ww = Ctrl.ww;
			BackGround.wh = 0;
			BackGround.div0.removeChild(BackGround.canvas);
			BackGround.canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			BackGround.context = BackGround.canvas.getContext("2d") as CanvasRenderingContext2D;
			BackGround.canvas.width = BackGround.ww;
			BackGround.canvas.height = BackGround.img.height;
			BackGround.div0.appendChild(BackGround.canvas);
		}
		if(BackGround.wh != Ctrl.wh){
			// 画面縦幅が変わったらcanvasの位置を調整する
			BackGround.wh = Ctrl.wh;
			BackGround.canvas.style.top = ((BackGround.wh - BackGround.canvas.height) * 0.5) + "px";
		}
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// ループする背景
		var imgw = BackGround.img.width;
		var pos = BackGround.action % imgw;
		var num = Math.ceil(BackGround.ww / BackGround.img.width) + 1;
		for(var i = 0; i < num; i++){
			BackGround.context.drawImage(BackGround.img, imgw * (i - 1) + pos, 0);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

