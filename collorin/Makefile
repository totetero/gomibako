ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
MIN = $(DIR)/node_modules/uglify-js/bin/uglifyjs
SRC_SRV_DIR = src_srv
SRC_CLI_DIR = src_cli
SRC_SRV_SRCS = $(shell find $(SRC_SRV_DIR) -name "*.jsx")
SRC_CLI_SRCS = $(shell find $(SRC_CLI_DIR) -name "*.jsx")

test: build

# --------------------------------

build: game.js content/main.js

tool: toolImgCrypt.js toolMakeData.js toolMakeMotion.js

# --------------------------------

clean:
	rm game.js content/main.js tool*.js

# --------------------------------

start: build
	node game.js

srvStart: build
	node_modules/forever/bin/forever start game.js

srvStop:
	node_modules/forever/bin/forever stop game.js

# --------------------------------

put: build
	rsync -av * uni:/home/tote/nodeTest/collorin_new

db:
	mongod &
	redis-server &

# --------------------------------

content/main.js: $(SRC_CLI_DIR)/Main.jsx $(SRC_CLI_SRCS)
	$(JSX) --executable web --output $@ $<

game.js: $(SRC_SRV_DIR)/Main.jsx $(SRC_SRV_SRCS)
	$(JSX) --executable node --output $@ $<

tool%.js: $(SRC_SRV_DIR)/tool/Tool%.jsx $(SRC_SRV_SRCS)
	$(JSX) --executable node --output $@ $<

%.min.js: %.js
	$(MIN) -c -o $@ $<

# --------------------------------
