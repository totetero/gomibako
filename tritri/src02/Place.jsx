// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 場所クラス

class Place{
	var flag : boolean = false;
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D) : void {
		if(!this.flag){return;}
		context.drawImage(ImageLoader.list["mapchip.png"], 0, 0);
	}
}

