import "js.jsx";
import "js/web.jsx";

import "Loader.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// サウンドクラス
class Sound{
	static var isSupported = false;
	static var _loaded = false;
	static var _playable = false;
	static var _playing = "";

	// WebAudioAPI用
	static var context : AudioContext;
	static var _bgmSource : AudioBufferSourceNode;
	static var _bgmFadeInGain : GainNode;
	static var _bgmFadeOutGain : GainNode;
	static var _bgmVolumeGain : GainNode;
	static var _sefVolumeGain : GainNode;

	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		// WebAudioAPIのAudioContextを作成
		if(Sound.context == null){try{Sound.context = new AudioContext();}catch(e : Error){}}
		if(Sound.context == null){try{Sound.context = new webkitAudioContext();}catch(e : Error){}}
		if(Sound.context != null){
			// WebAudioAPIのAudioContext作成成功
			Sound.isSupported = true;

			Sound._bgmVolumeGain = Sound._contextCreateGain();
			Sound._bgmVolumeGain.connect(Sound.context.destination);
			Sound.setBgmVolume(dom.window.localStorage.getItem("setting_bgmVolume"));

			Sound._sefVolumeGain = Sound._contextCreateGain();
			Sound._sefVolumeGain.connect(Sound.context.destination);
			Sound.setSefVolume(dom.window.localStorage.getItem("setting_sefVolume"));

			Sound._bgmFadeInGain = Sound._contextCreateGain();
			Sound._bgmFadeInGain.connect(Sound._bgmVolumeGain);

			Sound._bgmFadeOutGain = Sound._contextCreateGain();
			Sound._bgmFadeOutGain.connect(Sound._bgmVolumeGain);

			Loader.soundContext = Sound.context;
			Loader.loadContents("sound", function() : void{
				Sound._loaded = true;
				if(Sound._playable && Sound._playing != ""){
					var bgmid = Sound._playing;
					Sound._playing = "";
					Sound.playBGM(bgmid);
				}
			});
		}
	}

	// ----------------------------------------------------------------
	// タップによるサウンド再生許可
	static function setPlayable() : void{
		if(!Sound._playable && !!Sound.context){
			Sound._playable = true;
			if(Sound._loaded && Sound._playing != ""){
				var bgmid = Sound._playing;
				Sound._playing = "";
				Sound.playBGM(bgmid);
			}else{
				// 無音再生
				var source = Sound.context.createBufferSource();
				source.connect(Sound.context.destination);
				Sound._sourceStart(source, Sound.context.currentTime);
			}
		}
	}

	// ----------------------------------------------------------------
	// BGM再生
	static function playBGM(bgmid : string) : void{
		// 同じBGMなら何もしない
		if(Sound._playing == bgmid || bgmid == ""){return;}
		Sound._playing = bgmid;

		if(Sound._playable){
			var fadeTime = 1.0;
			var tag = "bgm_" + bgmid;
			if(Sound._bgmSource != null){
				// 前のBGM停止
				var temp = Sound._bgmFadeInGain;
				Sound._bgmFadeInGain = Sound._bgmFadeOutGain;
				Sound._bgmFadeOutGain = temp;
				Sound._bgmFadeOutGain.gain.setValueAtTime(1, Sound.context.currentTime);
				Sound._bgmFadeOutGain.gain.linearRampToValueAtTime(0, Sound.context.currentTime + fadeTime);
				Sound._sourceStop(Sound._bgmSource, Sound.context.currentTime + fadeTime);
				Sound._bgmSource = null;
			}
			if(Loader.snds[tag] != null && bgmid != "none"){
				// 新しいBGM再生
				Sound._bgmFadeInGain.gain.setValueAtTime(0, Sound.context.currentTime);
				Sound._bgmFadeInGain.gain.linearRampToValueAtTime(1, Sound.context.currentTime + fadeTime);
				Sound._bgmSource = Sound.context.createBufferSource();
				Sound._bgmSource.loop = true;
				Sound._bgmSource.buffer = Loader.snds[tag];
				Sound._bgmSource.connect(Sound._bgmFadeInGain);
				Sound._sourceStart(Sound._bgmSource, Sound.context.currentTime);
			}
		}
	}

	// ----------------------------------------------------------------
	// BGM停止
	static function stopBGM() : void{
		Sound.playBGM("none");
	}

	// ----------------------------------------------------------------
	// 効果音再生
	static function playSE(seid : string) : void{
		var tag = "sef_" + seid;
		if(Sound._playable && Loader.snds[tag] != null){
			// SE再生
			var source = Sound.context.createBufferSource();
			source.buffer = Loader.snds[tag];
			source.connect(Sound._sefVolumeGain);
			Sound._sourceStart(source, Sound.context.currentTime);
		}
	}

	// ----------------------------------------------------------------
	// BGM音量設定
	static function setBgmVolume(tag : Nullable.<string>) : void{
		if(!Sound.isSupported){return;}
		if(tag != "high" && tag != "middle" && tag != "low" && tag != "off"){tag = "off";}
		dom.window.localStorage.setItem("setting_bgmVolume", tag);

		if(tag == "high"){Sound._bgmVolumeGain.gain.value = 0.9;}
		else if(tag == "middle"){Sound._bgmVolumeGain.gain.value = 0.4;}
		else if(tag == "low"){Sound._bgmVolumeGain.gain.value = 0.1;}
		else{Sound._bgmVolumeGain.gain.value = 0.0;}
	}

	// ----------------------------------------------------------------
	// 効果音音量設定
	static function setSefVolume(tag : Nullable.<string>) : void{
		if(!Sound.isSupported){return;}
		if(tag != "high" && tag != "middle" && tag != "low" && tag != "off"){tag = "off";}
		dom.window.localStorage.setItem("setting_sefVolume", tag);

		if(tag == "high"){Sound._sefVolumeGain.gain.value = 0.9;}
		else if(tag == "middle"){Sound._sefVolumeGain.gain.value = 0.4;}
		else if(tag == "low"){Sound._sefVolumeGain.gain.value = 0.1;}
		else{Sound._sefVolumeGain.gain.value = 0.0;}
	}

	// ----------------------------------------------------------------
	// webAudioAPIの後方互換性
	static function _contextCreateGain() : GainNode{return ((js.eval("!!Sound.context.createGain") as boolean) ? Sound.context.createGain() : Sound.context.createGainNode());}
	static function _sourceStart(source : AudioBufferSourceNode, when : number) : void{if(js.eval("!!source.start") as boolean){source.start(when);}else{source.noteOn(when);}}
	static function _sourceStop(source : AudioBufferSourceNode, when : number) : void{if(js.eval("!!source.stop") as boolean){source.stop(when);}else{source.noteOff(when);}}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
