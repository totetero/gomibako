import 'js/web.jsx';
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	static var imgs : Map.<HTMLImageElement>;
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "/getdat");
		xhr.addEventListener("load", function(e : Event){
			var jdat = JSON.parse(xhr.responseText);
			// 画像準備
			Main.imgs = {} : Map.<HTMLImageElement>;
			Main.regImg(jdat["imgs"] as Map.<string>, function(){
				// テスト
				var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
				var context = canvas.getContext("2d") as CanvasRenderingContext2D;
				dom.document.body.appendChild(canvas);
				context.drawImage(Main.imgs["player"], 0, 0);
			});
		});
		xhr.send();
	}

	// ----------------------------------------------------------------
	// base64情報配列から画像登録
	static function regImg(b64imgs : Map.<string>, callback : function():void) : void{
		var count = 0;
		for(var i in b64imgs){count++;}
		for(var i in b64imgs){
			var img = dom.createElement("img") as HTMLImageElement;
			img.onload = function(e : Event){
				// すべての登録が終わったらコールバック
				if(--count == 0){callback();}
			};
			img.src = b64imgs[i];
			Main.imgs[i] = img;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
