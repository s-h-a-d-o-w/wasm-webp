import {decode, encode, init} from '../src';

init().then(async () => {
  console.log('=============================================');
  console.log('Benchmarks: Encoding and then decoding again');
  console.log('=============================================');

  let data = new Array(256 * 256 * 4).fill(0);

  console.log('100 256x256 images...');

  let start = Date.now();
  for (let i = 0; i < 100; i++) {
    const temp = await encode(Buffer.from(data), {
      width: 256,
      height: 256,
    });
    await decode(Buffer.from(temp));
  }

  console.log(`Finished in: ${Date.now() - start} ms\n`);

  // TODO: Having an alpha channel results in heap running out of memory.
  // Can this be prevented?
  data = new Array(4096 * 4096 * 3).fill(0);

  console.log('====================================');
  console.log('A 4096x4096 image...');

  start = Date.now();
  for (let i = 0; i < 1; i++) {
    const temp = await encode(Buffer.from(data), {
      width: 4096,
      height: 4096,
      hasAlpha: false,
    });
    await decode(Buffer.from(temp));
  }

  console.log(`Finished in: ${Date.now() - start} ms`);
  console.log('====================================');
});
