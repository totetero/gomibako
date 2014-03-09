import "js/web.jsx";

import "../../util/Ctrl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用キャラクターリストクラス
class PartsCharaListItem{
	// HTMLタグ
	static const _htmlTag = """
		<div class="icon"></div>
		<div class="name"></div>
	""";

	// 並べ替え
	static function sort(list : PartsCharaListItem[], type : string) : void{
		// TODO
	}

	// ----------------------------------------------------------------

	var bodyDiv : HTMLDivElement;
	var iconDiv : HTMLDivElement;

	var select = false;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(name : string){
		this.bodyDiv = dom.document.createElement("div") as HTMLDivElement;
		this.bodyDiv.innerHTML = PartsCharaListItem._htmlTag;
		this.bodyDiv.className = "core-charaListItem";
		this.iconDiv = this.bodyDiv.getElementsByClassName("icon").item(0) as HTMLDivElement;
		(this.bodyDiv.getElementsByClassName("name").item(0) as HTMLDivElement).innerHTML = name;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

