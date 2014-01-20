import "js.jsx";

import "./EventCartridge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

abstract class Page extends EventPlayer{
	static var current : Page;

	// test
	static function setPage(page : Page) : void{
		if(Page.current != null){Page.current.dispose();}
		Page.current = page;
	}

	// イベントの設定
	static function serialPush(sec : EventCartridge) : void{Page.current.serialPush(sec);}
	static function parallelPush(pec : EventCartridge) : void{Page.current.parallelPush(pec);}
	static function serialCutting(sec : EventCartridge) : void{Page.current.serialCutting(sec);}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
