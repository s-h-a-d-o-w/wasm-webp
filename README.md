# Usage

- This repo contains a submodule, so you need to run `git clone --recursive ...` (Why: so people don't have to 
look for libwebp, we can have a unified compilation workflow that refers to the library within this repo AND stability 
by using a specific tag of libwebp for the submodule.)
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

# TODO

- Ensure that `CMakeLists.txt` is well-defined (e.g. `$(EMSCRIPTEN)/system/include` - even if `EMSCRIPTEN` isn't set, 
  compilation works.)
- Required `cmake` version may not be accurate. It seems like it used to be set to a higher version than necessary but now, the 
  opposite might be the case.

