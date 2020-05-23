import path from 'path';

interface WebpJSEmscriptenModule extends EmscriptenModule {
  cwrap: typeof cwrap;
  getValue: typeof getValue;
}

let Module: WebpJSEmscriptenModule;
const wasm: any = {};

export function init() {
  return new Promise((resolve) => {
    require(path.join(__dirname, '../build/wasm_webp'))().then(
      (module: WebpJSEmscriptenModule) => {
        Module = module;

        wasm.version = Module.cwrap('version', 'number', []);
        wasm.getInfo = Module.cwrap('getInfo', 'number', ['number', 'number']);
        wasm.decode = Module.cwrap('decode', 'number', [
          'number',
          'number',
          'number',
        ]);
        wasm.encode = Module.cwrap('encode', 'number', [
          'number',
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
  const {width, height, hasAlpha} = getInfo(buffer);

  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.decode(ptr, buffer.byteLength, hasAlpha);
  const resultView = new Uint8Array(
    Module.HEAPU8.buffer,
    resultPtr,
    width * height * (hasAlpha ? 4 : 3)
  );

  Module._free(ptr);
  Module._free(resultPtr);

  return {
    data: resultView,
    hasAlpha,
    height,
    width,
  };
}

export function decode(buffer: Buffer): Promise<ReturnType<typeof decodeSync>> {
  return new Promise((resolve) => {
    resolve(decodeSync(buffer));
  });
}

type EncodeOptions = {
  height: number;
  width: number;
  hasAlpha?: boolean;
  quality?: number;
};

export function encodeSync(
  buffer: Buffer,
  {height, width, hasAlpha = true, quality = 80}: EncodeOptions
) {
  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.encode(
    ptr,
    width,
    height,
    width * (hasAlpha ? 4 : 3),
    quality,
    hasAlpha
  );

  const outputLength = Module.getValue(resultPtr, 'i32');
  const outputPtr = Module.getValue(resultPtr + 4, 'i32');

  const resultView = new Uint8Array(
    Module.HEAPU8.buffer,
    outputPtr,
    outputLength
  );

  Module._free(ptr);
  Module._free(outputPtr);
  // TODO: This is necessary to get correct results. But why?
  // It frees the memory that we return a Uint8Array view on. So if anything,
  // calling it should result in INCORRECT results, not the other way around?
  // Is it maybe due to some emcc magic where it keeps track of freeing memory
  // and then copies data to where it's accessible by JS?
  Module._free(resultPtr);

  return resultView;
}

export function encode(
  buffer: Buffer,
  options: EncodeOptions
): Promise<ReturnType<typeof encodeSync>> {
  return new Promise((resolve) => {
    resolve(encodeSync(buffer, options));
  });
}

export function getInfo(buffer: Buffer) {
  const ptr = Module._malloc(buffer.byteLength);
  Module.HEAPU8.set(new Uint8Array(buffer), ptr);

  const resultPtr = wasm.getInfo(ptr, buffer.byteLength);

  if (resultPtr !== 0) {
    // See WebPBitstreamFeatures here: https://github.com/webmproject/libwebp/blob/master/src/webp/decode.h
    const width = Module.getValue(resultPtr, 'i32') as number;
    const height = Module.getValue(resultPtr + 4, 'i32') as number;
    const hasAlpha = Module.getValue(resultPtr + 8, 'i32') as number;
    const hasAnimation = Module.getValue(resultPtr + 12, 'i32') as number;
    const format = Module.getValue(resultPtr + 16, 'i32') as number;

    Module._free(ptr);
    Module._free(resultPtr);

    return {
      width,
      height,
      format,
      hasAlpha: hasAlpha === 1,
      hasAnimation,
    };
  }

  throw new Error('Could not retrieve info.');
}
