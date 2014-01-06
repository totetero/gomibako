var setup = (function(){
	var scrolling = 0;

	// ----------------------------------------------------------------

	// マウス動作設定関数
	var setMouse = function(btns){
		var rootDiv = document.getElementById("root");
		var loadingDiv = document.getElementsByClassName("loading").item(0);
		var isTouch = ('ontouchstart' in window);
		var isPress = false;
		var mx = 0;
		var my = 0;
		var tempMy0 = my;
		var tempBtn = null;
		var tempLoading = false;

		// マウス座標の獲得
		var getmmv = function(e){
			mx = isTouch ? e.changedTouches[0].clientX : e.clientX;
			my = isTouch ? e.changedTouches[0].clientY : e.clientY;
		}

		// 押下状態の描画関数
		var setHover = function(div, hover){
			var find = (div.className.indexOf(" hover") >= 0);
			if(hover && !find){div.className += " hover";}
			if(!hover && find){div.className = div.className.replace(/ hover/g , "");}
		};

		// マウスボタン押下開始
		var mdnfn = function(e){
			var tag = e.target.tagName.toLowerCase();
			if(tag != "a" && tag != "input"){
				getmmv(e);
				isPress = true;
				if(!tempLoading){
					// ボタン
					tempBtn = null;
					for(var i = 0; i < btns.length; i++){
						var b = btns[i].div.getBoundingClientRect();
						if(b.left < mx && mx < b.right && b.top < my && my < b.bottom){
							tempBtn = btns[i];
							setHover(tempBtn.div, true);
							break;
						}
					}
					// スクロール
					tempMy0 = my;
				}
				// 上位ノードへのイベントキャンセル
				e.preventDefault();
			}
		};

		// マウス移動
		var mmvfn = function(e){
			if(isPress){
				getmmv(e);
				if(tempLoading){
				}else if(tempBtn != null){
					// ボタン
					var b = tempBtn.div.getBoundingClientRect();
					if(!(b.left < mx && mx < b.right && b.top < my && my < b.bottom)){
						setHover(tempBtn.div, false);
						tempBtn = null;
					}
				}else{
					// スクロール
					scrolling += tempMy0 - my;
					tempMy0 = my;
				}
				e.preventDefault();
			}
		};

		// マウスボタン押下終了
		var mupfn = function(e){
			if(isPress){
				getmmv(e);
				if(tempLoading){
					// ローディング非表示
					loadingDiv.style.visibility = "hidden";
					tempLoading = false;
				}else if(tempBtn != null){
					// ボタン
					setHover(tempBtn.div, false);
					if(tempBtn.func){tempBtn.func();}
					if(tempBtn.url){
						var url = tempBtn.url;
						setTimeout(function(){location.href = url;}, 0);
						loadingDiv.style.visibility = "visible";
						tempLoading = true;
					}
					tempBtn = null;
				}
				isPress = false;
				e.preventDefault();
			}
		};

		// イベントリスナ設定
		if(isTouch){
			rootDiv.addEventListener("touchstart", mdnfn);
			rootDiv.addEventListener("touchmove", mmvfn);
			rootDiv.addEventListener("touchend", mupfn);
			rootDiv.addEventListener("touchcancel", mupfn);
		}else{
			rootDiv.addEventListener("mousedown", mdnfn);
			rootDiv.addEventListener("mousemove", mmvfn);
			rootDiv.addEventListener("mouseup", mupfn);
			rootDiv.addEventListener("mouseout", function(e){
				var x = e.clientX;
				var y = e.clientY;
				var w = window.innerWidth;
				var h = window.innerHeight;
				if(isPress && (x <= 0 || w <= x || y <= 0 || h <= y)){
					mupfn(e);
				}
			});
			document.addEventListener("wheel", function (e){
				scrolling -= e.wheelDelta / 10;
				e.preventDefault();
			});
		}
	};

	// ----------------------------------------------------------------

	// メインループ設定関数
	var setMainloop = function(){
		var scrollDiv = document.getElementById("scroll");
		var scrollBarDiv = document.getElementById("scrollBar");
		var logoDiv = document.getElementsByClassName("title").item(0).getElementsByClassName("logo").item(0);
		var wsize = 0;
		var scrolled = 0;
		var logoMotionCount = 0;

		// スクロール領域長さの確認
		var headerHeight = document.getElementById("header").getBoundingClientRect().bottom;
		var footerHeight = document.getElementById("footer").getBoundingClientRect().height;
		var length = headerHeight + 20 + footerHeight;
		scrollDiv.style.minHeight = length + "px";

		// メインループ本処理
		var mainloop = function(){
			// スクロール処理
			var w = window.innerHeight;
			if(wsize != w || scrolled != scrolling){
				wsize = w;
				var max = length - wsize;
				if(scrolling > max){scrolling = max;}
				if(scrolling < 0){scrolling = 0;}
				scrolled = scrolling;
				// スクロール描画
				scrollDiv.style.top = -scrolled + "px";
				// スクロールバー描画
				if(wsize < length){
					scrollBarDiv.style.top = (scrolled * wsize / length) + "px";
					scrollBarDiv.style.height = (wsize * wsize / length) + "px";
				}else{
					scrollBarDiv.style.height = "0px";
				}
			}
			// ロゴ動作処理
			var s = 1 + 0.1 * Math.cos(logoMotionCount++ * 0.2);
			logoDiv.style.transform = logoDiv.style.webkitTransform = "scale(" + s + ")";
			// ループ処理
			setTimeout(mainloop, 33);
		}
		mainloop();
	};

	// ----------------------------------------------------------------

	// セットアップ関数
	return function(loggedin){
		if(loggedin){
			setMouse([
				{div: document.getElementById("mypage"), url: "/mypage"},
				{div: document.getElementById("logout"), url: "/logout"},
			]);
		}else{
			setMouse([
				{div: document.getElementById("login_tw"), url: "/auth/twitter"},
				{div: document.getElementById("login_fb"), func: function(){alert("使えないよ");}},
			]);
		}
		setMainloop();
	}

	// ----------------------------------------------------------------
})();

