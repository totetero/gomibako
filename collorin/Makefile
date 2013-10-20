DIR = $(shell pwd)
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
GAME_JSX = $(DIR)/src_cli/game/jsx

dafault: jsx srv

srv:
	node $(DIR)/src_srv/main.js

jsx: game

game: $(GAME_JSX)/game.js
$(GAME_JSX)/game.js: $(GAME_JSX)/*.jsx
	cd $(GAME_JSX) ; $(JSX) --output $@ Main.jsx

%.min.js: %.js
	$(MIN) -c -o $@ $<

setup:
	npm install jsx uglify-js
	npm install express ejs
	npm install mongoose connect-mongo
	npm install passport passport-local passport-twitter

