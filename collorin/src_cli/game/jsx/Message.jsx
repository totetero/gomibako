import 'js/web.jsx';

import 'Ctrl.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メッセージ表示クラス
class Message{
	static var _div : HTMLDivElement;
	static var _actionMax : int = 8;
	static var _action : int = 0;
	static var _str : string;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// div作成
		Message._div = dom.document.createElement("div") as HTMLDivElement;
		Message._div.className = "message";
		Message._div.style.display = "none";
		// DOM登録
		Ctrl.div.appendChild(Message._div);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// 入れ替えモーション
		if(Message._action != 0){
			if(Message._action++ > Message._actionMax){
				Message._action = -Message._actionMax;
			}
		}
		
		// actionShow & actionHide ?
	}

	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// ボタン入れ替えモーション
		if(Message._action + Message._actionMax == 0){
			Message._div.style.display = (Message._str != "") ? "block" : "none";
			Message._div.innerHTML = Message._str;
		}else{
			var num = Math.abs(Message._action) / Message._actionMax;
			Message._div.style.right = (12 - 144 * num * num) + "px";
		}
	}

	// ----------------------------------------------------------------
	// 表示文字列指定
	static function setMsg(str : string) : void{
		//Message._action = (Message._action == 0) ? 1 : Math.abs(Message._action);
		//Message._str = str;

		// test
		if(Message._str == "" || str == ""){
			Message._action = 1;
		}else{
			Message._div.innerHTML = str;
		}
		Message._str = str;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

