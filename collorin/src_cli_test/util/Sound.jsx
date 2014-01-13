import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// サウンドクラス
class Sound{
	static var _playable : boolean;
	static var playing : boolean;

	// WebAudioAPI用
	static var _context : AudioContext;
	static var _bgmbuffer : Sound.WebAudioAPIbuffer;
	static var _sebuffer : Map.<Sound.WebAudioAPIbuffer>;

	// Audioタグ用
	static var _bgmaudio : HTMLAudioElement;

	// ----------------------------------------------------------------
	// 初期化
	static function init(bgmurl : string) : void{
		Sound._playable = false;
		Sound.playing = (dom.window.localStorage.getItem("soundPlaying") == "on");
		// WebAudioAPIのAudioContextを作成
		try{Sound._context = new webkitAudioContext();}catch(e : Error){}
		if(Sound._context != null){
			// WebAudioAPIのAudioContext作成成功
			Sound._sebuffer = {} :  Map.<Sound.WebAudioAPIbuffer>;
			Sound._sebuffer["coin"] = new Sound.WebAudioAPIbuffer("/sound/se/se_coinget_1.m4a", null);
			Sound._sebuffer["dice"] = new Sound.WebAudioAPIbuffer("/sound/se/se_pow_1.m4a", null);
			Sound._bgmbuffer = new Sound.WebAudioAPIbuffer(bgmurl, function(){if(Sound._playable && Sound.playing){Sound.playing = false; Sound.toggle();}});
		}else{
			// WebAudioAPIが使えないのでAudioタグで我慢する
			Sound._bgmaudio = dom.document.createElement("audio") as HTMLAudioElement;
			Sound._bgmaudio.src = bgmurl;
			Sound._bgmaudio.addEventListener("canplay", function(e:Event){if(Sound._playable && Sound.playing){Sound.playing = false; Sound.toggle();}}, false);
			Sound._bgmaudio.addEventListener("ended", function(e:Event){Sound._bgmaudio.currentTime = 0; Sound._bgmaudio.play();}, false);
			Sound._bgmaudio.load();
		}
	}

	// ----------------------------------------------------------------
	// サウンド再生可能
	static function setPlayable() : void{
		Sound._playable = true;
		if(Sound.playing){Sound.playing = false; Sound.toggle();}
	}

	// ----------------------------------------------------------------
	// サウンドON/OFF切り替え
	static function toggle() : void{
		if(!Sound.playing){
			// サウンドON
			Sound.playing = true;
			dom.window.localStorage.setItem("soundPlaying", "on");

			if(!Sound._playable){
			}else if(Sound._context != null){
				// WebAudioAPI用BGM再生
				if(Sound._bgmbuffer.buffer != null){
					var source = Sound._context.createBufferSource();
					source.loop = true;
					source.buffer = Sound._bgmbuffer.buffer;
					source.connect(Sound._context.destination);
					source.noteOn(Sound._context.currentTime);
					Sound._bgmbuffer.source = source;
				}
			}else{
				// Audioタグ用BGM再生
				Sound._bgmaudio.play();
			}
		}else{
			// サウンドOFF
			Sound.playing = false;
			dom.window.localStorage.setItem("soundPlaying", "off");

			if(Sound._context != null){
				// WebAudioAPI用BGM停止
				if(Sound._bgmbuffer.source != null){
					Sound._bgmbuffer.source.noteOff(0);
					Sound._bgmbuffer.source = null;
				}
				// SE停止
				for(var i in Sound._sebuffer){
					if(Sound._sebuffer[i].source != null){
						Sound._sebuffer[i].source.noteOff(0);
						Sound._sebuffer[i].source = null;
					}
				}
			}else{
				// Audioタグ用BGM停止
				Sound._bgmaudio.pause();
			}
		}
	}

	// ----------------------------------------------------------------
	// 効果音再生
	static function play(se : string) : void{
		if(Sound.playing && Sound._playable && Sound._context != null && Sound._sebuffer[se] != null && Sound._sebuffer[se].buffer != null){
			// SE再生
			var source = Sound._context.createBufferSource();
			source.buffer = Sound._sebuffer[se].buffer;
			source.connect(Sound._context.destination);
			source.noteOn(Sound._context.currentTime);
			Sound._sebuffer[se].source = source;
		}
	}

	// ----------------------------------------------------------------
	// WebAudioAPI用バッファークラス 補助クラス
	class WebAudioAPIbuffer{
		var buffer : AudioBuffer;
		var source : AudioBufferSourceNode;
		// コンストラクタ
		function constructor(url : string, callback : function():void){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.responseType = "arraybuffer";
			xhr.addEventListener("load", function(e : Event){
				var binary = xhr.response as ArrayBuffer;
				Sound._context.decodeAudioData(binary, function(buffer : AudioBuffer){
					this.buffer = buffer;
					if(callback != null){callback();}
				});
			});
			xhr.send();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

