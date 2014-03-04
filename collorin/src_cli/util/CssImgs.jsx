import "js/web.jsx";

import "Loader.jsx";
import "Util.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// cssで使用する画像の作成クラス
class CssImgs{
	static var sheet : CSSStyleSheet;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// スタイルシート準備
		var style = dom.document.createElement("style") as HTMLStyleElement;
		style.type = "text/css";
		dom.document.head.appendChild(style);
		CssImgs.sheet = style.sheet as CSSStyleSheet;
		var cssIndex = CssImgs.sheet.cssRules.length;

		// ピッカーボタン画像
		if(Loader.b64imgs["corePickerArrow"] == null){
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
			Loader.b64imgs["corePickerArrow"] = Util.cvsToBase64(canvas);
		}
		CssImgs.sheet.insertRule(".core-picker-btn .arrow{background-image: url(" + Loader.b64imgs["corePickerArrow"] + ")}", cssIndex++);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

