import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画クラス
class Drawer{
	static var _measureCtx : CanvasRenderingContext2D;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// 文字サイズ計測用コンテキスト作成
		var measureCvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Drawer._measureCtx = measureCvs.getContext("2d") as CanvasRenderingContext2D;
	}

	// ----------------------------------------------------------------
	// 箱描画
	static function drawBox(ctx : CanvasRenderingContext2D, img : HTMLImageElement, x : int, y : int, w : int, h : int) : void{
		if(img == null || img.width == 0 || img.height == 0){return;}
		var w10 = Math.floor(img.width * 0.5);
		var h10 = Math.floor(img.height * 0.5);
		var w05 = Math.floor(Math.min(w, w10) * 0.5);
		var h05 = Math.floor(Math.min(h, h10) * 0.5);
		ctx.drawImage(img, w10, h10, 1, 1, x + w05, y + h05, w - w05 * 2, h - h05 * 2); // 中央
		ctx.drawImage(img, w10    ,       0,   1, h10, x     + w05, y          , w - w05 * 2, h05        ); // 上
		ctx.drawImage(img, w10 + 1, h10    , w10,   1, x + w - w05, y     + h05, w05        , h - h05 * 2); // 右
		ctx.drawImage(img, w10    , h10 + 1,   1, h10, x     + w05, y + h - h05, w - w05 * 2, h05        ); // 下
		ctx.drawImage(img,       0, h10    , w10,   1, x          , y     + h05, w05        , h - h05 * 2); // 左
		ctx.drawImage(img,       0,       0, w10, h10, x          , y          , w05, h05); // 左上
		ctx.drawImage(img, w10 + 1,       0, w10, h10, x + w - w05, y          , w05, h05); // 右上
		ctx.drawImage(img, w10 + 1, h10 + 1, w10, h10, x + w - w05, y + h - h05, w05, h05); // 右下
		ctx.drawImage(img,       0, h10 + 1, w10, h10, x          , y + h - h05, w05, h05); // 左下
	}

	// ----------------------------------------------------------------
	// 文字列描画キャンバス作成
	static function createText(text : string, size : int, color : string, maxWidth : int) : HTMLCanvasElement{
		var font = size + "px 'monospace'";
		// 文字サイズ計測
		Drawer._measureCtx.font = font;
		var measure = Drawer._measureCtx.measureText(text);
		// 文字サイズオーバー確認
		if(maxWidth > 0 && measure.width > maxWidth){
			while(text.length > 0){
				text = text.slice(0, -1);
				measure = Drawer._measureCtx.measureText(text + "...");
				if(measure.width < maxWidth){
					text = text + "...";
					break;
				}
			}
		}
		// キャンバス作成
		var cvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		var ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
		cvs.width = Math.max(measure.width, 1); // 大きさ0だと描画時に不具合がおこる可能性がある
		cvs.height = Math.floor(size * 1.5);
		ctx.font = font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = color;
		// 文字列描画
		ctx.fillText(text, cvs.width * 0.5, cvs.height * 0.5);
		//ctx.fillStyle = "rgba(0,0,0,0.3)";
		//ctx.fillRect(0, 0, cvs.width, cvs.height);
		return cvs;
	}
	// オーバーロード
	static function createText(text : string, size : int, color : string) : HTMLCanvasElement{return Drawer.createText(text, size, color, 0);}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

