#!/bin/sh

mkdir build > /dev/null 2>&1
cd build

set CMAKE_C_COMPILER=$BINARYEN_ROOT/emscripten/emcc
cmake -DCMAKE_TOOLCHAIN_FILE=$BINARYEN_ROOT/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_BUILD_TYPE=Release ../
make
