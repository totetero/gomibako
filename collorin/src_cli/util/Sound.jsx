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
	static var _playing = "";

	// WebAudioAPI用
	static var _context : AudioContext;
	static var _buffer : Map.<AudioBuffer>;
	static var _bgmSource : AudioBufferSourceNode;
	static var _bgmFadeInGain : GainNode;
	static var _bgmFadeOutGain : GainNode;
	static var _bgmVolumeGain : GainNode;
	static var _sefVolumeGain : GainNode;

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

			Sound._bgmVolumeGain = Sound._context.createGain();
			Sound._bgmVolumeGain.connect(Sound._context.destination);
			Sound._bgmVolumeGain.gain.value = 0.1;

			Sound._sefVolumeGain = Sound._context.createGain();
			Sound._sefVolumeGain.connect(Sound._context.destination);
			Sound._sefVolumeGain.gain.value = 0.1;

			Sound._bgmFadeInGain = Sound._context.createGain();
			Sound._bgmFadeInGain.connect(Sound._bgmVolumeGain);

			Sound._bgmFadeOutGain = Sound._context.createGain();
			Sound._bgmFadeOutGain.connect(Sound._bgmVolumeGain);

			Sound._buffer = {} : Map.<AudioBuffer>;
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

	// ----------------------------------------------------------------
	// BGM再生
	static function playBGM(bgmid : string) : void{
		var tag = "bgm_" + bgmid;
		// 同じBGMなら何もしない
		if(Sound._playing == tag){return;}
		Sound._playing = tag;

		if(Sound._playable && Sound._buffer[tag] != null){
			var fadeTime = 1.0;
			if(Sound._bgmSource != null){
				// 前のBGM停止
				var temp = Sound._bgmFadeInGain;
				Sound._bgmFadeInGain = Sound._bgmFadeOutGain;
				Sound._bgmFadeOutGain = temp;
				Sound._bgmFadeOutGain.gain.setValueAtTime(1, Sound._context.currentTime);
				Sound._bgmFadeOutGain.gain.linearRampToValueAtTime(0, Sound._context.currentTime + fadeTime);
				Sound._bgmSource.stop(Sound._context.currentTime + fadeTime);
			}
			// 新しいBGM再生
			Sound._bgmFadeInGain.gain.setValueAtTime(0, Sound._context.currentTime);
			Sound._bgmFadeInGain.gain.linearRampToValueAtTime(1, Sound._context.currentTime + fadeTime);
			Sound._bgmSource = Sound._context.createBufferSource();
			Sound._bgmSource.loop = true;
			Sound._bgmSource.buffer = Sound._buffer[tag];
			Sound._bgmSource.connect(Sound._bgmFadeInGain);
			Sound._bgmSource.start(Sound._context.currentTime);
		}
	}

	// ----------------------------------------------------------------
	// BGM停止
	static function stopBGM() : void{
		Sound._playing = "";

		if(Sound._playable && Sound._bgmSource != null){
			var fadeTime = 1.0;
			var temp = Sound._bgmFadeInGain;
			Sound._bgmFadeInGain = Sound._bgmFadeOutGain;
			Sound._bgmFadeOutGain = temp;
			Sound._bgmFadeOutGain.gain.setValueAtTime(1, Sound._context.currentTime);
			Sound._bgmFadeOutGain.gain.linearRampToValueAtTime(0, Sound._context.currentTime + fadeTime);
			Sound._bgmSource.stop(Sound._context.currentTime + fadeTime);
			Sound._bgmSource = null;
		}
	}

	// ----------------------------------------------------------------
	// 効果音再生
	static function playSE(seid : string) : void{
		var tag = "sef_" + seid;
		if(Sound._playable && Sound._buffer[tag] != null){
			// SE再生
			var source = Sound._context.createBufferSource();
			source.buffer = Sound._buffer[tag];
			source.connect(Sound._sefVolumeGain);
			source.start(Sound._context.currentTime);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

