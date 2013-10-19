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
			var b64imgs = jdat["imgs"] as Map.<string>;
			var count = 0;
			for(var i in b64imgs){count++;}
			for(var i in b64imgs){
				var img = dom.createElement("img") as HTMLImageElement;
				img.onload = function(e : Event){
					if(--count == 0){
						// すべての画像準備が終わったら処理開始
						var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
						var context = canvas.getContext("2d") as CanvasRenderingContext2D;
						dom.document.body.appendChild(canvas);
						context.drawImage(Main.imgs["player"], 0, 0);
					}
				};
				img.src = b64imgs[i];
				Main.imgs[i] = img;
			}
		});
		xhr.send();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
