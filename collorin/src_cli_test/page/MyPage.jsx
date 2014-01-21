import "js/web.jsx";

import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.innerHTML = """
			<div>
				""" + "にょろにょろ" + """
			</div>
		""";
		Ctrl.sdiv.appendChild(this.div);
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class MypageTest extends EventCartridge{
	// コンストラクタ
	function constructor(){
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		return true;
	}

	// 描画
	override function draw() : void{
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

