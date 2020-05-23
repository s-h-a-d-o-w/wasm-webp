#!/bin/bash

set -e

test -d libwebp/build && (
  echo
  echo "libwebp/build already exists => Skipped compilation."
  echo
) || (
  echo "======================"
  echo "Compiling libwebp..."
  echo "======================"
  apt-get update
  apt-get install -qqy autoconf libtool libpng-dev pkg-config
  cd libwebp
  autoreconf -fiv
  rm -rf build || true
  mkdir -p build && cd build
  emconfigure ../configure \
    --disable-libwebpdemux \
    --disable-wic \
    --disable-gif \
    --disable-tiff \
    --disable-jpeg \
    --disable-png \
    --disable-sdl \
    --disable-gl \
    --disable-threading \
    --disable-neon-rtcd \
    --disable-neon \
    --disable-sse2 \
    --disable-sse4.1
  emmake make
)

echo "======================"
echo "Compiling wasm..."
echo "======================"

rm -rf build
[ -d build ] || mkdir build > /dev/null 2>&1
# On using O3 without breaking the binary:
# https://github.com/emscripten-core/emscripten/issues/6882#issuecomment-406745898
# (Results in ~20% better performance for 4K encoding, 5% for 512x512)
time emcc \
  -s WASM=1 \
  -O3 \
  -s MODULARIZE=1 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS='[cwrap, getValue]' \
  -s EXPORTED_FUNCTIONS='[_free, _malloc]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -I libwebp \
  -o ./build/wasm_webp.js \
  ./src/webp.c \
  libwebp/build/src/.libs/libwebp.a

echo
echo DONE
