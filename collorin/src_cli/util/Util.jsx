import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 雑多ユーティリティクラス
class Util{
	// ----------------------------------------------------------------
	// html要素にcssTransform適用
	static function cssTransform(element : HTMLElement, style : string) : void{
		element.style.webkitTransform = style;
		element.style.MozTransform = style;
	}
	static function cssTranslate(element : HTMLElement, x : number, y : number) : void{
		Util.cssTransform(element, "translate(" + x + "px," + y + "px)");
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

