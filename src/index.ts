import path from 'path';

interface WebpJSEmscriptenModule extends EmscriptenModule {
  cwrap: typeof cwrap;
  getValue: typeof getValue;
}

let Module: WebpJSEmscriptenModule;
const wasm: any = {};

export function init() {
  return new Promise((resolve) => {
    require(path.join(__dirname, '../build_wasm/webp_wasm'))().then(
      (module: WebpJSEmscriptenModule) => {
        Module = module;

        wasm.version = Module.cwrap('version', 'number', []);
        wasm.getInfo = Module.cwrap('getInfo', 'number', ['number', 'number']);
        wasm.decode = Module.cwrap('decode', 'number', ['number', 'number']);
        wasm.encode = Module.cwrap('encode', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
        ]);

        resolve();
      }
    );
  });
}

export function decodeSync(buffer: Buffer) {
  const {width, height} = getInfo(buffer);

  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.decode(ptr, buffer.byteLength);
  const resultView = new Uint8Array(
    Module.HEAPU8.buffer,
    resultPtr,
    width * height * 4
  );

  Module._free(ptr);
  Module._free(resultPtr);

  return new Uint8ClampedArray(resultView);
}

export function decode(buffer: Buffer): Promise<ReturnType<typeof decodeSync>> {
  return new Promise((resolve) => {
    resolve(decodeSync(buffer));
  });
}

export function encodeSync(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number
) {
  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.encode(ptr, width, height, width * 4, quality);

  const outputLength = Module.getValue(resultPtr, 'i32');
  const outputPtr = Module.getValue(resultPtr + 4, 'i32');

  const resultView = new Uint8Array(
    Module.HEAPU8.buffer,
    outputPtr,
    outputLength
  );

  Module._free(ptr);
  Module._free(resultPtr);

  return new Uint8ClampedArray(resultView);
}

export function encode(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number
): Promise<ReturnType<typeof encodeSync>> {
  return new Promise((resolve) => {
    resolve(encodeSync(buffer, width, height, quality));
  });
}

export function getInfo(buffer: Buffer) {
  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.getInfo(ptr, buffer.byteLength);

  const success = !!Module.getValue(resultPtr, 'i32');
  if (!success) {
    Module._free(resultPtr);
    throw new Error('Could not get info of buffer.');
  }

  const width = Module.getValue(resultPtr + 4, 'i32') as number;
  const height = Module.getValue(resultPtr + 8, 'i32') as number;

  Module._free(ptr);
  Module._free(resultPtr);

  return {width, height};
}
