import "js.jsx";
import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// サウンドクラス
class Sound{
	// WebAudioAPI用
	static var context : AudioContext;
	static var bgmbuffer : AudioBuffer;
	static var bgmsource : AudioBufferSourceNode;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// WebAudioAPIのAudioContextを作成
		try{Sound.context = new webkitAudioContext();}catch(e : Error){}
		if(Sound.context != null){
			// WebAudioAPIのAudioContext作成成功
			var xhr = new XMLHttpRequest();
			xhr.open('GET', "/sound/bgm/bgm_stagebgm_07_hq.m4a");
			xhr.responseType = "arraybuffer";
			xhr.addEventListener("load", function(e : Event){
				var binary = xhr.response as ArrayBuffer;
				Sound.context.decodeAudioData(binary, function(buffer : AudioBuffer){
					Sound.bgmbuffer = buffer;
				});
			});
			xhr.send();
		}else{
			// WebAudioAPIが使えないのでAudioタグで我慢する
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

