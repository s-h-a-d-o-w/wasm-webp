A webp library that doesn't rely on native dependencies.

# TODO

`EMSCRIPTEN_KEEPALIVE` saves the functions from getting removed with `O2` but not `O3`.

[Adding `EXPORTED_FUNCTIONS=...`](https://emscripten.org/docs/getting_started/FAQ.html#why-do-functions-in-my-c-c-source-code-vanish-when-i-compile-to-javascript-and-or-i-get-no-functions-to-process) 
did not solve the problem.

# How to build

Sidenote about emscripten: Not sure why they call the path to `emcc` `BINARYEN_ROOT` but if they ever change that, 
the path is one level above the `emcc` folder, so e.g.: `/mnt/c/Users/sh4dow/development/emsdk/upstream/34254`.

# Usage

- This repo contains a submodule, so you need to run `git clone --recursive ...` (Why: so people don't have to 
look for libwebp, we can have a unified compilation workflow that refers to the library within this repo AND stability 
by using a specific tag of libwebp for the submodule - currently `v1.0.3`.)
- Install emscripten SDK.

# Changes compared to https://github.com/kenchris/wasm-webp

It seems to me that DCMAKE_TOOLCHAIN_FILE isn't used (I tried 
`cmake -Wdev --trace -DCMAKE_TOOLCHAIN_FILE=somenonsense -DCMAKE_BUILD_TYPE=Release > cmake.log 2>&1` but could 
find not occurrence of `somenonsense` in the log), so I removed it.

# Notes

Add the following arguments at the bottom of `CMakeLists.txt` to enable debug output for the WASM module (`ASSERTIONS` is probably
  self-explanatory, `O0` disables optimizations):
  ```
      -s ASSERTIONS=1 \
      -O0 \
  ```
