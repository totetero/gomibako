ifeq ($(OS),Windows_NT)
	DIR = $(shell cygpath -m `pwd`)
else
	DIR = $(shell pwd)
endif
JSX = $(DIR)/node_modules/jsx/bin/jsx
SRC_SRV_DIR = src_srv
SRC_CLI_DIR = src_cli

# ---- test ----
test: build

start: build
	node game.js

build: game.js content/main.js

clean:
	rm game.js content/main.js

game.js: $(shell find $(SRC_SRV_DIR) -name "*.jsx")
	$(JSX) --executable node --output $@ $(SRC_SRV_DIR)/Main.jsx

content/main.js: $(shell find $(SRC_CLI_DIR) -name "*.jsx")
	$(JSX) --executable web --output $@ $(SRC_CLI_DIR)/Main.jsx

