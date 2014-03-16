import "js.jsx";
import "js/web.jsx";

import "Loader.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// サウンドクラス
class Sound{
	static var bgmVolume = -1;
	static var sefVolume = -1;
	static var _playable = false;

	// WebAudioAPI用
	static var _context : AudioContext;
	static var _buffer : Map.<AudioBuffer>;
	static var _bgmSource : AudioBufferSourceNode;
	static var _sefSource : AudioBufferSourceNode[];

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// WebAudioAPIのAudioContextを作成
		if(Sound._context == null){try{Sound._context = new AudioContext();}catch(e : Error){}}
		if(Sound._context == null){try{Sound._context = new webkitAudioContext();}catch(e : Error){}}
		if(Sound._context != null){
			// WebAudioAPIのAudioContext作成成功
			var bgmVolume = dom.window.localStorage.getItem("setting_bgmVolume");
			var sefVolume = dom.window.localStorage.getItem("setting_sefVolume");
			Sound.bgmVolume = Math.max(0, (bgmVolume != null) ? bgmVolume as number : 1);
			Sound.sefVolume = Math.max(0, (sefVolume != null) ? sefVolume as number : 1);
			Sound._buffer = {} : Map.<AudioBuffer>;
			Sound._sefSource = new AudioBufferSourceNode[];
			Loader.loadSnd(null, function(buffers : Map.<ArrayBuffer>) : void{
				var count = 0;
				for(var tag in buffers){count++;}
				for(var tag in buffers){
					(function(tag : string){
						Sound._context.decodeAudioData(buffers[tag], function(buffer : AudioBuffer){
							Sound._buffer[tag] = buffer;
							if(--count == 0){
								// すべての登録が終わった
								//if(Sound._playable && Sound.playing){
								//	Sound.playing = false;
								//	Sound.toggle();
								//}
							}
						});
					})(tag);
				}
			}, function() : void{});
		}
	}

	// ----------------------------------------------------------------
	// タップによるサウンド再生許可
	static function setPlayable() : void{
		if(!Sound._playable && !!Sound._context){
			Sound._playable = true;
			Sound.playSE("ok");
		}
	}

	/*
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
					source.start(Sound._context.currentTime);
					Sound._bgmbuffer.source = source;
				}
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
				for(var i in Sound._sefbuffer){
					if(Sound._sefbuffer[i].source != null){
						Sound._sefbuffer[i].source.noteOff(0);
						Sound._sefbuffer[i].source = null;
					}
				}
			}
		}
	}
	*/

	// ----------------------------------------------------------------
	// 効果音再生
	static function playSE(seid : string) : void{
		var tag = "sef_" + seid;
		if(Sound._playable && Sound._buffer[tag] != null && Sound.sefVolume > 0){
			// SE再生
			var source = Sound._context.createBufferSource();
			source.buffer = Sound._buffer[tag];
			source.connect(Sound._context.destination);
			source.start(Sound._context.currentTime);
			//Sound._source[tag] = source;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

