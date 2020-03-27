cmake_minimum_required (VERSION 3.1)
project(webp_wasm)

SET(CMAKE_BUILD_TYPE_INIT "Release")

file(GLOB SOURCE_FILES 
 ./src/webp.c
 ./libwebp/src/dec/*.c
 ./libwebp/src/dsp/*.c
 ./libwebp/src/demux/*.c
 ./libwebp/src/enc/*.c
 ./libwebp/src/mux/*.c
 ./libwebp/src/utils/*.c
)

add_executable(webp_wasm ${SOURCE_FILES})
target_include_directories(webp_wasm PRIVATE
    ./libwebp
)
set_target_properties(webp_wasm PROPERTIES LINK_FLAGS
    "-s WASM=1 \
    -O2 \
    -s MODULARIZE=1 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='[\"cwrap\", \"getValue\"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -I libwebp")