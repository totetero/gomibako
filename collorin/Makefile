ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
SRC_SRV_DIR = src_srv
SRC_CLI_DIR = src_cli

# ---- test ----
test: build

start: build
	node game.js

srvStart: build
	node_modules/forever/bin/forever start game.js

srvStop:
	node_modules/forever/bin/forever stop game.js

put: build
	rsync -av * uni:/home/tote/nodeTest/collorin_new

build: game.js content/main.js

tool: toolImgCrypt.js toolMakeData.js toolMakeMotion.js

db:
	mongod &
	redis-server &

clean:
	rm game.js content/main.js

game.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/Main.jsx

content/main.js: $(shell find $(SRC_CLI_DIR) -name "*.jsx")
	$(JSX) --executable web --output $@ $(SRC_CLI_DIR)/Main.jsx

toolImgCrypt.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/ToolImgCrypt.jsx

toolMakeData.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/ToolMakeData.jsx

toolMakeMotion.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/ToolMakeMotion.jsx

%.min.js: %.js
	$(MIN) -c -o $@ $<

