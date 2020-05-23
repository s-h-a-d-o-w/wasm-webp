import {decode, encode, init, getInfo} from '../src';

// Since using jest results in: "failed to asynchronously prepare wasm: abort("both async and sync fetching of the wasm failed").",
// quick googling didn't result in anything and I have no time to file an issue, I decided to do this simple homegrown test instead.
function printPassOrFail(title: string, result: boolean) {
  const label = result ? 'PASS' : 'FAIL';
  console.log(label, title);
}

init().then(async () => {
  const rawData = [255, 0, 255, 0];

  const encoded = await encode(Buffer.from(rawData), {
    width: 1,
    height: 1,
  });
  const {data: decoded} = await decode(Buffer.from(encoded));
  // Since compression is lossy, output can vary. While it should stay the same with same settings
  // (unless libwebp changes), I don't want to rely on a magic number just so I can do a strict
  // comparison.
  let passed = decoded.every(function(value, index) {
    return Math.abs(value - rawData[index]) < 3;
  });
  printPassOrFail(
    'After encoding and decoding again, output roughly matches input',
    passed
  );
  !passed &&
    console.log(`Processed data: expected ${rawData} - got ${decoded}`);

  try {
    // TODO: For some reason, ts-node-dev swallows the thrown exception instead of
    // having node print it.
    getInfo(Buffer.from(decoded));
    console.log(
      `FAIL getInfo() throws an exception if not used on a webp image`
    );
  } catch (e) {
    console.log(
      `PASS getInfo() throws an exception if not used on a webp image`
    );
  }

  const info = getInfo(Buffer.from(encoded));
  const expectedWidth = 1,
    expectedHeight = 1;
  passed =
    info.width === expectedWidth &&
    info.height === expectedHeight &&
    info.hasAlpha;
  printPassOrFail(
    'getInfo() returns correct width, height and alpha status',
    passed
  );
  !passed &&
    console.log(
      `getInfo(): expected ${expectedWidth}/${expectedHeight} (alpha: true) - got ${info.width}/${info.height} (alpha: ${info.hasAlpha})`
    );

  const header = [82, 73, 70, 70, 90];
  passed = encoded.slice(0, 5).every((value, index) => value === header[index]);
  printPassOrFail('header of encoded image looks legit', passed);
  !passed &&
    console.log(`Header: expected ${header} - got ${encoded.slice(0, 5)}`);

  //

  const encodedNoAlpha = await encode(Buffer.from(rawData.slice(0, 3)), {
    width: 1,
    height: 1,
    hasAlpha: false,
  });
  const {data: decodedNoAlpha} = await decode(Buffer.from(encodedNoAlpha));
  passed =
    decodedNoAlpha.length === 3 &&
    decodedNoAlpha.every(function(value, index) {
      return Math.abs(value - rawData[index]) < 3;
    });
  printPassOrFail(
    '(NO ALPHA): After encoding and decoding again, output roughly matches input',
    passed
  );
  !passed &&
    console.log(
      `Processed data: expected ${rawData.slice(0, 3)} - got ${decodedNoAlpha}`
    );
  const infoNoAlpha = getInfo(Buffer.from(encodedNoAlpha));
  passed = !infoNoAlpha.hasAlpha;
  printPassOrFail('(NO ALPHA): getInfo() returns correct alpha status', passed);
  !passed &&
    console.log(
      `getInfo(): expected (alpha: false) - got (alpha: ${info.hasAlpha})`
    );
});
