import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ローディング表示クラス
class Loading{
	static const _maxOpacity = 5;
	static var _div : HTMLDivElement;
	static var _count = 0;
	static var _action = 0;
	static var _opacity = 0;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Loading._div = dom.document.getElementById("loading") as HTMLDivElement;
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ローディング処理
		if(Loading._count > 0 || Loading._opacity > 0){
			if(Loading._action == 0){Loading._div.style.display = "block";}

			// 透明度
			if(Loading._count > 0){
				if(Loading._action <= Loading._maxOpacity){
					Loading._opacity = Loading._action;
					Loading._div.style.opacity = (Loading._opacity / Loading._maxOpacity) as string;
				}
			}else{
				Loading._opacity--;
				Loading._div.style.opacity = (Loading._opacity / Loading._maxOpacity) as string;
			}

			// アニメーション
			switch(Loading._action % 40){
				case  0: Loading._div.setAttribute("txt", "loading"); break;
				case 10: Loading._div.setAttribute("txt", "loading."); break;
				case 20: Loading._div.setAttribute("txt", "loading.."); break;
				case 30: Loading._div.setAttribute("txt", "loading..."); break;
			}

			Loading._action++;
		}else if(Loading._action != 0){
			Loading._div.style.display = "none";
			Loading._action = 0;
		}
	}

	// ----------------------------------------------------------------
	// ローディング表示開始
	static function show() : void{
		Loading._count++;
	}

	// ----------------------------------------------------------------
	// ローディング表示終了
	static function hide() : void{
		Loading._count = Math.max(Loading._count - 1, 0);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

