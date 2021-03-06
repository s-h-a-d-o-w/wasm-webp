A webp library that brings libwebp's [simple decoding/encoding APIs](https://developers.google.com/speed/webp/docs/api#simple_decoding_api) 
to JS via web assembly.

It has only been tested with Node.js. If you need the full API and something that possibly even works in web workers, check out 
[saschazar21's wasm webp library](https://github.com/saschazar21/webassembly/tree/master/packages/webp). These two projects should probably 
unify but because I use a different approach (C and wrapper vs. Sascha's C++ with emcc bindings) 

... I SHOULD TRY TO JUST ADD SIMPLE API TO Sascha's thing!!!
(But... first check what webp output with my lib is like.)


# TODO (Contributions appreciated)

- Ensure that the library also works when used in the browser from a web worker.
- Make it possible to use `O3` optimization (recommended for production in emscripten docs).

  Currently, `EMSCRIPTEN_KEEPALIVE` saves the functions from getting removed with `O2` but not `O3`.

  [Adding `EXPORTED_FUNCTIONS=...`](https://emscripten.org/docs/getting_started/FAQ.html#why-do-functions-in-my-c-c-source-code-vanish-when-i-compile-to-javascript-and-or-i-get-no-functions-to-process) 
  did not solve the problem.

# How to build

Requirements: *nix environment, docker

# Notes

Add the following arguments at the bottom of `build.sh` to enable debug output for the WASM module (`ASSERTIONS` is probably
  self-explanatory, `O0` disables optimizations):
  ```
      -s ASSERTIONS=1 \
      -O0 \
  ```
