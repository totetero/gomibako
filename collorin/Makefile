ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
LESS = $(DIR)/node_modules/less/bin/lessc
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
GAME_JSX = src_cli_old/game/jsx
CHAT_JSX = src_cli_old/chat/jsx
SRC_SRV_DIR = src_srv
SRC_CLI_DIR = src_cli

# ---- test ----
test: game.js public/main/index.js public/main/index.css
	node game.js

db:
	mongod &
	redis-server &

clean:
	rm game.js public/main/index.js public/main/index.css

game.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/Main.jsx

public/main/index.js: $(shell find $(SRC_CLI_DIR) -name "*.jsx")
	$(JSX) --executable web --output $@ $(SRC_CLI_DIR)/Main.jsx
	#$(MIN) -c -o $(@:%.js=%.min.js) $@

public/main/index.css: $(shell find $(SRC_CLI_DIR) -name "*.less")
	$(LESS) --compress $(SRC_CLI_DIR)/less/main.less $@
# ---- test ----

default: game_old.js $(GAME_JSX)/game.js $(CHAT_JSX)/chat.js
	node game_old.js

game_old.js: $(shell find src_srv -name "*.jsx")
	$(JSX) --executable node --output $@ src_srv/zzz_Main_old.jsx

$(GAME_JSX)/game.js: $(shell find $(GAME_JSX) -name "*.jsx")
	cd $(GAME_JSX) ; $(JSX) --output $(DIR)/$@ Main.jsx

$(CHAT_JSX)/chat.js: $(shell find $(CHAT_JSX) -name "*.jsx")
	cd $(CHAT_JSX) ; $(JSX) --output $(DIR)/$@ Main.jsx

%.min.js: %.js
	$(MIN) -c -o $@ $<

put:
	rsync -av * uni:/home/tote/toterabo/srvtest/

