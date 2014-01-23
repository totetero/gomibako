import "js/web.jsx";

import "../util/EventCartridge.jsx";
import "../util/Ctrl.jsx";
import "./Page.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MyPage extends Page{
	// HTMLタグ
	var htmlTag = """
		<div class="navi">
			<div class="b1">ワールド</div>
			<div class="b2">クエスト</div>
			<div class="b3">キャラクター</div>
			<div class="b4">アイテム</div>
		</div>

		<div class="footer">おしらせバナースペース</div>

		<div class="header">
			<div class="title">マイページ</div>
			<div class="btn back">back</div>
			<div class="btn menu">menu</div>
		</div>
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "mypage";
		this.div.innerHTML = this.htmlTag;
		Ctrl.sdiv.appendChild(this.div);

		this.serialPush(new MypageTest(this.div));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class MypageTest extends EventCartridge{
	var btnList : Map.<HTMLDivElement> = {} : Map.<HTMLDivElement>;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.btnList["b1"] = div.getElementsByClassName("b1").item(0) as HTMLDivElement;
		this.btnList["b2"] = div.getElementsByClassName("b2").item(0) as HTMLDivElement;
		this.btnList["b3"] = div.getElementsByClassName("b3").item(0) as HTMLDivElement;
		this.btnList["b4"] = div.getElementsByClassName("b4").item(0) as HTMLDivElement;
		this.btnList["back"] = div.getElementsByClassName("back").item(0) as HTMLDivElement;
		this.btnList["menu"] = div.getElementsByClassName("menu").item(0) as HTMLDivElement;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){
			var box = this.btnList[name].getBoundingClientRect();
			var x0 = box.left - Ctrl.sx;
			var y0 = box.top - Ctrl.sy;
			var x1 = x0 + box.width;
			var y1 = y0 + box.height;
			var className = this.btnList[name].className;
			if(x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1){
				if(className.indexOf(" hover") < 0){this.btnList[name].className += " hover";}
			}else{
				this.btnList[name].className = className.replace(/ hover/g , "");
			}
		}
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

