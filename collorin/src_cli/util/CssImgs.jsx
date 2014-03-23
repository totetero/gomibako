import "js/web.jsx";

import "Loader.jsx";
import "Util.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// cssで使用する画像の作成クラス
class CssImgs{
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		var sheet = Loader.style.sheet as CSSStyleSheet;

		// ピッカーボタン画像
		var tag = "css_core_picker_arrow";
		if(Loader.csss[tag] == null){
			var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
			var context = canvas.getContext("2d") as CanvasRenderingContext2D;
			canvas.width = 64;
			canvas.height = 64;
			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.strokeStyle = "black";
			context.lineWidth = 5;
			context.beginPath();
			context.moveTo(31, 32 + 15);
			context.lineTo(31 - 15, 31 - 10);
			context.lineTo(32 + 15, 31 - 10);
			context.lineTo(32, 32 + 15);
			context.closePath();
			context.fill();
			context.stroke();
			Loader.csss[tag] = tag.replace(/^css_/, "cssimg_");
			sheet.insertRule("." + Loader.csss[tag] + "{background-image: url(" + Util.cvsToBase64(canvas) + ")}", sheet.cssRules.length);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

