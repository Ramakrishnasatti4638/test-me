CXX      ?= g++
CXXFLAGS ?= -O2 -std=c++17 -Wall -Wextra

BUILD_DIR := build
OBJ_DIR   := $(BUILD_DIR)/obj
BIN       := $(BUILD_DIR)/app

SRCS := src/main.cpp src/util.cpp
OBJS := $(patsubst src/%.cpp,$(OBJ_DIR)/%.o,$(SRCS))

.PHONY: all clean run
all: $(BIN)

$(BIN): $(OBJS)
	$(CXX) $(CXXFLAGS) $^ -o $@

$(OBJ_DIR)/%.o: src/%.cpp | $(OBJ_DIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

run: $(BIN)
	./$(BIN)

clean:
	rm -rf $(BUILD_DIR)
