import 'js/web.jsx';

import 'Ctrl.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ステータス表示クラス
class Status{
	static var div : HTMLDivElement;
	static var ndiv : HTMLDivElement;
	static var hdiv0 : HTMLDivElement;
	static var hdiv1 : HTMLDivElement;
	static var hdiv2 : HTMLDivElement;
	static var sdiv0 : HTMLDivElement;
	static var sdiv1 : HTMLDivElement;
	static var sdiv2 : HTMLDivElement;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// div作成
		Status.div = dom.document.createElement("div") as HTMLDivElement;
		Status.ndiv = dom.document.createElement("div") as HTMLDivElement;
		Status.hdiv0 = dom.document.createElement("div") as HTMLDivElement;
		Status.hdiv1 = dom.document.createElement("div") as HTMLDivElement;
		Status.hdiv2 = dom.document.createElement("div") as HTMLDivElement;
		Status.sdiv0 = dom.document.createElement("div") as HTMLDivElement;
		Status.sdiv1 = dom.document.createElement("div") as HTMLDivElement;
		Status.sdiv2 = dom.document.createElement("div") as HTMLDivElement;
		var hpDiv = dom.document.createElement("div") as HTMLDivElement;
		var spDiv = dom.document.createElement("div") as HTMLDivElement;
		Status.div.className = "status";
		Status.ndiv.className = "name";
		Status.hdiv0.className = "covor";
		Status.hdiv1.className = "param";
		Status.hdiv2.className = "param";
		Status.sdiv0.className = "covor";
		Status.sdiv1.className = "param";
		Status.sdiv2.className = "param";
		hpDiv.className = "gauge hp";
		spDiv.className = "gauge sp";
		hpDiv.innerHTML = "HP";
		spDiv.innerHTML = "SP";
		Status.hdiv1.style.backgroundColor = "red";
		Status.hdiv2.style.backgroundColor = "pink";
		Status.sdiv1.style.backgroundColor = "blue";
		Status.sdiv2.style.backgroundColor = "pink";
		// DOM登録
		//hpDiv.appendChild(Status.hdiv2);
		hpDiv.appendChild(Status.hdiv1);
		hpDiv.appendChild(Status.hdiv0);
		//spDiv.appendChild(Status.sdiv2);
		spDiv.appendChild(Status.sdiv1);
		spDiv.appendChild(Status.sdiv0);
		Status.div.appendChild(Status.ndiv);
		Status.div.appendChild(hpDiv);
		Status.div.appendChild(spDiv);
		Ctrl.div.appendChild(Status.div);

		// test
		Status.ndiv.innerHTML = "ノエル";
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

