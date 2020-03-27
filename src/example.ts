import {decode, encode, init, getInfo} from '.';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

const pngInputPath = path.join(__dirname, '../assets/test.png');
const webpInputPath = path.join(__dirname, '../assets/test.webp');
const pngOutputPath = path.join(__dirname, '../assets/output.png');
const webpOutputPath = path.join(__dirname, '../assets/output.webp');

init().then(async () => {
  // Ensure no old output is left that possible distorts the result
  if (fs.existsSync(pngOutputPath)) {
    fs.unlinkSync(pngOutputPath);
  }
  if (fs.existsSync(webpOutputPath)) {
    fs.unlinkSync(webpOutputPath);
  }

  // Decoding
  const webp = fs.readFileSync(webpInputPath);
  const webpDecoded = await decode(webp);
  const webpInfo = await getInfo(webp);
  const rawImage = await Jimp.create(webpInfo.width, webpInfo.height);

  rawImage.bitmap.data = Buffer.from(webpDecoded);
  fs.writeFileSync(pngOutputPath, await rawImage.getBufferAsync(Jimp.MIME_PNG));

  console.log('Decoding done, see assets/output.png.');

  // Encoding
  const image = await Jimp.read(pngInputPath);
  fs.writeFileSync(
    webpOutputPath,
    await encode(
      Buffer.from(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height,
      80
    )
  );

  console.log('Encoding done, see assets/output.webp.');
});
