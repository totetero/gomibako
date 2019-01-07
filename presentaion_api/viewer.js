(function(global){
	"use strict";

	// 読み込みが終わったら処理開始
	document.addEventListener("DOMContentLoaded", function(e){

		// ウェブページを2画面対応にするPresentation APIを使ってみる
		// https://qiita.com/tomoyukilabs/items/f7b5971cf107d769bd39

		// ----------------------------------------------------------------
		// ----------------------------------------------------------------
		// ----------------------------------------------------------------

		// 変数初期化
		const divDisp = document.getElementById("disp");
		const divCtrlPageMax = document.getElementById("ctrlPageMax");
		const divCtrlPageCurr = document.getElementById("ctrlPageCurr");
		const pageNum = divDisp.children.length;
		let pageIndex = 0;

		// 初期ページ設定
		divDisp.children.item(pageIndex).style.display = "block";
		divCtrlPageMax.innerHTML = pageNum;
		divCtrlPageCurr.innerHTML = pageIndex + 1;

		// 戻るボタン
		document.getElementById("buttonPrev").addEventListener("click", () => {
			if(pageIndex <= 0){return;}
			divDisp.children.item(pageIndex).style.display = "none";
			pageIndex--;
			divCtrlPageCurr.innerHTML = pageIndex + 1;
			divDisp.children.item(pageIndex).style.display = "block";
		});

		// 進むボタン
		document.getElementById("buttonNext").addEventListener("click", () => {
			if(pageIndex >= pageNum - 1){return;}
			divDisp.children.item(pageIndex).style.display = "none";
			pageIndex++;
			divCtrlPageCurr.innerHTML = pageIndex + 1;
			divDisp.children.item(pageIndex).style.display = "block";
		});

		// キー押下
		document.addEventListener("keyup", function(e){
			let isActive = false;
			if(e.keyCode === 37){isActive = true;}
			if(e.keyCode === 39){isActive = true;}
			if(!isActive){return;}
			e.preventDefault();
			e.stopPropagation();
		});

		// キー解放
		document.addEventListener("keyup", function(e){
			let isActive = false;
			if(e.keyCode === 37){isActive = true; document.getElementById("buttonPrev").click();}
			if(e.keyCode === 39){isActive = true; document.getElementById("buttonNext").click();}
			if(!isActive){return;}
			e.preventDefault();
			e.stopPropagation();
		});

		// プレゼンテーション処理
		navigator.presentation && navigator.presentation.receiver && navigator.presentation.receiver.connectionList.then(list => {
			(addConnection => {
				// 接続検知
				list.connections.forEach(connection => addConnection(connection));
				list.addEventListener("connectionavailable", event => addConnection(event.connection));
			})(connection => {
				// コントローラからメッセージ受信
				connection.addEventListener("message", event => {
					const data = JSON.parse(event.data);
					// ページ遷移
					if(data.type === "prev"){document.getElementById("buttonPrev").click();}
					if(data.type === "next"){document.getElementById("buttonNext").click();}
					// ページ情報を送信
					const commentList = divDisp.children.item(pageIndex).getElementsByClassName("page-comment");
					const commentData = (commentList.length > 0) ? commentList.item(0).innerHTML : "なし";
					connection.send(JSON.stringify({type: "info", page_index: pageIndex, page_num: pageNum, comment: commentData,}));
				});
				// 切断検知
				connection.addEventListener("close", event => console.log(event));
			});
		});

		// ----------------------------------------------------------------
		// ----------------------------------------------------------------
		// ----------------------------------------------------------------
	});
})(this);
