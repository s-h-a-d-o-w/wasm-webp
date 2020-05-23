import {decode, encode, init} from '../src';

init().then(async () => {
  console.log('=============================================');
  console.log('Benchmarks: Encoding and then decoding again');
  console.log('=============================================');

  let resolution = 512;

  console.log('Encoding 50 512x512 images...');
  const data = Buffer.alloc(resolution * resolution * 4);

  let start = Date.now();
  for (let i = 0; i < 50; i++) {
    await encode(Buffer.from(data), {
      width: resolution,
      height: resolution,
    });
  }

  let duration = Date.now() - start;
  console.log(`Finished in: ${duration} ms (${duration / 50} ms per image)\n`);

  console.log('Decoding 50 512x512 images...');
  const encoded = Buffer.from(
    await encode(Buffer.from(data), {
      width: resolution,
      height: resolution,
    })
  );

  start = Date.now();
  for (let i = 0; i < 50; i++) {
    await decode(encoded);
  }
  duration = Date.now() - start;
  console.log(`Finished in: ${duration} ms (${duration / 50} ms per image)\n`);

  console.log('Encoding a single 4K image...');
  resolution = 4096;
  start = Date.now();
  const encoded4K = await encode(Buffer.alloc(resolution * resolution * 4), {
    width: resolution,
    height: resolution,
  });
  console.log(`Finished in: ${Date.now() - start} ms\n`);

  console.log('Decoding a single 4K image...');
  start = Date.now();
  await decode(Buffer.from(encoded4K));
  console.log(`Finished in: ${Date.now() - start} ms\n`);
});
