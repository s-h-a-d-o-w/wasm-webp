import {decode, encode, init, getInfo} from '../src';

// Since using jest results in: "failed to asynchronously prepare wasm: abort("both async and sync fetching of the wasm failed").",
// quick googling didn't result in anything and I have no time to file an issue, I decided to do this simple homegrown test instead.
function printPassOrFail(title: string, result: boolean) {
  const label = result ? 'PASS' : 'FAIL';
  console.log(label, title);
}

init().then(async () => {
  const rawData = [255, 0, 255, 0];
  const encoded = await encode(Buffer.from(rawData), 1, 1, 80);
  const decoded = await decode(Buffer.from(encoded));
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

  const info = getInfo(Buffer.from(encoded));
  const expectedWidth = 1,
    expectedHeight = 1;
  passed = info.width === expectedWidth && info.height === expectedHeight;
  printPassOrFail('getInfo() returns correct width and height', passed);
  !passed &&
    console.log(
      `Info width/height: expected ${expectedWidth}/${expectedHeight} - got ${info.width}/${info.height}`
    );

  const header = [82, 73, 70, 70, 90];
  passed = encoded.slice(0, 5).every((value, index) => value === header[index]);
  printPassOrFail('header of encoded image looks legit', passed);
  !passed &&
    console.log(`Header: expected ${header} - got ${encoded.slice(0, 5)}`);
});
