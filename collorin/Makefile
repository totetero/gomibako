ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
GAME_JSX = src_cli/game/jsx
CHAT_JSX = src_cli/chat/jsx

dafault: jsx srv

srv:
	#$(JSX) --run src/Main.jsx
	$(JSX) --executable node --output game.js src_srv/Main.jsx && node game.js

jsx: game chat

game: $(GAME_JSX)/game.js
$(GAME_JSX)/game.js: $(GAME_JSX)/*.jsx
	cd $(GAME_JSX) ; $(JSX) --output $(DIR)/$@ Main.jsx

chat: $(CHAT_JSX)/chat.js
$(CHAT_JSX)/chat.js: $(CHAT_JSX)/*.jsx
	cd $(CHAT_JSX) ; $(JSX) --output $(DIR)/$@ Main.jsx

%.min.js: %.js
	$(MIN) -c -o $@ $<

