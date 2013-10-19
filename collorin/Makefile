DIR = $(shell pwd)
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
JSX_DST = $(DIR)/public/jsx

dafault: srv

game:
	cd $(DIR)/src_cli/game/src ; $(JSX) --output $(JSX_DST)/game.js Main.jsx

min:
	$(MIN) -c -o $(JSX_DST)/game.min.js $(JSX_DST)/game.js

srv:
	node $(DIR)/src_srv/main.js

setup:
	npm install jsx uglify-js
	npm install express ejs
	npm install mongoose connect-mongo
	npm install passport passport-local passport-twitter

