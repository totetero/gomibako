import 'js/web.jsx';
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メインクラス
class Main{
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "/getdat");
		xhr.addEventListener("load", function(e : Event){
			var jdat = JSON.parse(xhr.responseText);
			var imgs = jdat["imgs"] as Map.<string>;
			// test
			var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = canvas.getContext("2d") as CanvasRenderingContext2D;
			dom.document.body.appendChild(canvas);
			var img = dom.createElement("img") as HTMLImageElement;
			img.onload = function(e : Event){context.drawImage(img, 0, 0);};
			img.src = imgs["player"];
		});
		xhr.send();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
