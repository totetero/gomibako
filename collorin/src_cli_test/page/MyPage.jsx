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
	""";

	// コンストラクタ
	function constructor(){
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "mypage";
		this.div.innerHTML = this.htmlTag;
		Page.parentDiv.appendChild(this.div);

		// ヘッダ設定
		Page.titleDiv.innerHTML = "マイページ";
		Page.backDiv.innerHTML = "back";
		Page.menuDiv.innerHTML = "menu";

		this.serialPush(new MypageTest(this.div));
	}

	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

class MypageTest extends EventCartridge{
	var btnList : Map.<PageButton>;

	// コンストラクタ
	function constructor(div : HTMLDivElement){
		this.btnList = {} : Map.<PageButton>;
		this.btnList["b1"] = new PageButton(div.getElementsByClassName("b1").item(0) as HTMLDivElement);
		this.btnList["b2"] = new PageButton(div.getElementsByClassName("b2").item(0) as HTMLDivElement);
		this.btnList["b3"] = new PageButton(div.getElementsByClassName("b3").item(0) as HTMLDivElement);
		this.btnList["b4"] = new PageButton(div.getElementsByClassName("b4").item(0) as HTMLDivElement);
		this.btnList["back"] = new PageButton(Page.backDiv);
		this.btnList["menu"] = new PageButton(Page.menuDiv);
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		for(var name in this.btnList){this.btnList[name].calc();}

		if(this.btnList["b1"].trigger){
			this.btnList["b1"].trigger = false;
			log "pressed";
		}

		return true;
	}

	// 描画
	override function draw() : void{
		for(var name in this.btnList){this.btnList[name].draw();}
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

