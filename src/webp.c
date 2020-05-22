#include <stdlib.h>
#include "emscripten.h"
#include "../libwebp/src/webp/decode.h"
#include "../libwebp/src/webp/encode.h"

struct EncodedImage {
  size_t outputLength;
  uint8_t* output;
};

EMSCRIPTEN_KEEPALIVE
int version() {
  return WebPGetDecoderVersion();
}

// EMSCRIPTEN_KEEPALIVE
// int* getInfo(const uint8_t* data, size_t size) {
//   int* results = (int*) malloc(3 * sizeof(int));

//   int width;
//   int height;

//   // (const uint8_t* data, size_t size, int* w, int* h) -> int;
//   results[0] = WebPGetInfo(data, size, &width, &height);
//   results[1] = width;
//   results[2] = height;

//   return results;
// }

EMSCRIPTEN_KEEPALIVE
WebPBitstreamFeatures* getInfo(const uint8_t* data, size_t size) {
  int* results = (int*) malloc(3 * sizeof(int));

  WebPBitstreamFeatures* features = malloc(sizeof(struct WebPBitstreamFeatures));

  if(WebPGetFeatures(data, size, features) == VP8_STATUS_OK) {
                                return features;
                              }

  return 0;
}

EMSCRIPTEN_KEEPALIVE
uint8_t* decode(const uint8_t* data, size_t size, int hasAlpha) {
  int width;
  int height;

  uint8_t* buffer = hasAlpha ? WebPDecodeRGBA(data, size, &width, &height) : WebPDecodeRGB(data, size, &width, &height);
  return buffer;
}

// EMSCRIPTEN_KEEPALIVE
// uint8_t* decode(const uint8_t* data, size_t size) {
//   return decode(data, size, 1);
// }

EMSCRIPTEN_KEEPALIVE
struct EncodedImage* encode(const uint8_t* data, int width, int height, int stride, float qualityFactor, int hasAlpha) {
  uint8_t* output;
  size_t outputLength = hasAlpha 
    ? WebPEncodeRGBA(data, width, height, stride, qualityFactor, &output)
    : WebPEncodeRGB(data, width, height, stride, qualityFactor, &output);

  struct EncodedImage *imgData = malloc(sizeof(struct EncodedImage));
  imgData->outputLength = outputLength;
  imgData->output = output;
  return imgData;
}

// EMSCRIPTEN_KEEPALIVE
// struct EncodedImage* encode(const uint8_t* data, int width, int height, int stride, float quality_factor) {
//   return encode(data, width, height, stride, quality_factor, 1);
// }
