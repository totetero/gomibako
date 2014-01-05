var setup = function(loggedin){
	// ---------------- スクロール領域最小範囲設定 ----------------
	var headerHeight = document.getElementById("header").getBoundingClientRect().bottom;
	var footerHeight = document.getElementById("footer").getBoundingClientRect().height;
	document.getElementById("root").style.minHeight = (headerHeight + 20 + footerHeight) + "px";

	// ---------------- ローディングマスク設定 ----------------
	var loadingDiv = document.getElementsByClassName("loading").item(0);
	loadingDiv.addEventListener("click", function(e){loadingDiv.style.visibility = "hidden";});
	loadingDiv.style.visibility = "hidden";

	// ---------------- ボタン設定関数 ----------------
	var isTouch = ('ontouchstart' in window);
	var setButton = function(div, func){
		var isPress = false;
		// マウスがボタン領域内にあるか確認する関数
		var isOver = function(e){
			var x = isTouch ? e.changedTouches[0].clientX : e.clientX;
			var y = isTouch ? e.changedTouches[0].clientY : e.clientY;
			var b = div.getBoundingClientRect();
			return (b.left < x && x < b.right && b.top < y && y < b.bottom);
		};
		// 押下状態の描画関数
		var setHover = function(hover){
			var find = (div.className.indexOf(" hover") >= 0);
			if(hover && !find){div.className += " hover";}
			if(!hover && find){div.className = div.className.replace(/ hover/g , "");}
		};
		// マウスイベント設定
		var mdnfn = function(e){setHover(isPress = isOver(e)); e.preventDefault();};
		var mmvfn = function(e){if(isPress){setHover(isOver(e)); e.preventDefault();}};
		var mupfn = function(e){if(isPress){setHover(false); if(isOver(e)){func();} e.preventDefault();} isPress = false;};
		if(isTouch){
			div.addEventListener("touchstart", mdnfn);
			div.addEventListener("touchmove", mmvfn);
			div.addEventListener("touchend", mupfn);
			div.addEventListener("touchcancel", mupfn);
		}else{
			div.addEventListener("mousedown", mdnfn);
			div.addEventListener("mousemove", mmvfn);
			div.addEventListener("mouseup", mupfn);
			div.addEventListener("mouseout", mupfn);
		}
	};
	var setLinkButton = function(div, url){
		setButton(div, function(){
			setTimeout(function(){location.href = url;}, 0);
			loadingDiv.style.visibility = "visible";
		});
	}

	// ---------------- ロゴ動作設定 ----------------
	var logoMotionCount = 0;
	var logoMotion = function(img){
		var s = 1 + 0.1 * Math.cos(logoMotionCount++ * 0.2);
		img.style.transform = img.style.webkitTransform = "scale(" + s + ")";
		setTimeout(logoMotion, 33, img);
	}
	logoMotion(document.getElementById("titleLogo"));

	// ---------------- ログイン前後の固有処理----------------
	if(loggedin){
		// -------- ログイン後 --------
		setLinkButton(document.getElementById("mypage"), "/mypage");
		setLinkButton(document.getElementById("logout"), "/logout");
		// TODO お知らせとか
	}else{
		// -------- ログイン前 --------
		setLinkButton(document.getElementById("login_tw"), "/auth/twitter");
		setButton(document.getElementById("login_fb"), function(){alert("使えないよ")});
	}

	// ---------------- ----------------
	// TODO スクロールをjs制御にする?
};

