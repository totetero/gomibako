ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
LESS = $(DIR)/node_modules/less/bin/lessc
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
SRC_SRV_DIR = src_srv
#SRC_CLI_DIR = src_cli_old
SRC_CLI_DIR = src_cli

# ---- test ----
test: build

start: build
	node game.js

put: build
	rsync -av * uni:/home/tote/project/git/collorin/

build: game.js content/main.js content/main.css

tool: toolImgCrypt.js toolMakeData.js

db:
	mongod &
	redis-server &

clean:
	rm game.js content/main.js content/main.css

game.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/Main.jsx

content/main.js: $(shell find $(SRC_CLI_DIR) -name "*.jsx")
	$(JSX) --executable web --output $@ $(SRC_CLI_DIR)/Main.jsx
	#$(MIN) -c -o $(@:%.js=%.min.js) $@

content/main.css: $(shell find $(SRC_CLI_DIR) -name "*.less")
	$(LESS) --compress $(SRC_CLI_DIR)/less/main.less $@

toolImgCrypt.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/ToolImgCrypt.jsx

toolMakeData.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/ToolMakeData.jsx

%.min.js: %.js
	$(MIN) -c -o $@ $<

