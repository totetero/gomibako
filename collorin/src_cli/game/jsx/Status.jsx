import 'js/web.jsx';

import 'Ctrl.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス表示クラス
class Status{
	static var div : HTMLDivElement;
	static var hdiv0 : HTMLDivElement;
	static var hdiv1 : HTMLDivElement;
	static var hdiv2 : HTMLDivElement;
	static var sdiv0 : HTMLDivElement;
	static var sdiv1 : HTMLDivElement;
	static var sdiv2 : HTMLDivElement;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// DOM獲得
		Status.div = dom.document.getElementsByClassName("jsx_status status").item(0) as HTMLDivElement;
		var hdiv = Status.div.getElementsByClassName("hp").item(0) as HTMLDivElement;
		var sdiv = Status.div.getElementsByClassName("sp").item(0) as HTMLDivElement;
		Status.hdiv0 = hdiv.getElementsByClassName("wrap").item(0) as HTMLDivElement;
		Status.hdiv1 = hdiv.getElementsByClassName("param").item(1) as HTMLDivElement;
		Status.hdiv2 = hdiv.getElementsByClassName("param").item(0) as HTMLDivElement;
		Status.sdiv0 = sdiv.getElementsByClassName("wrap").item(0) as HTMLDivElement;
		Status.sdiv1 = sdiv.getElementsByClassName("param").item(1) as HTMLDivElement;
		Status.sdiv2 = sdiv.getElementsByClassName("param").item(0) as HTMLDivElement;

		// test
		Status.hdiv0.innerHTML = "30/100";
		Status.sdiv0.innerHTML = "80/100";
		Status.hdiv1.style.width = "30px";
		Status.hdiv2.style.width = "40px";
		Status.sdiv1.style.width = "80px";
		Status.sdiv2.style.width = "90px";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

