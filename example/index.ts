import {decode, encode, init, getInfo} from '../src';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

const originalPath = path.join(__dirname, '../assets/original.png');
const pngOutputPath = path.join(__dirname, '../assets/output.png');
const webpOutputPath = path.join(__dirname, '../assets/output.webp');

init().then(async () => {
  // Delete possible old output
  if (fs.existsSync(pngOutputPath)) {
    fs.unlinkSync(pngOutputPath);
  }
  if (fs.existsSync(webpOutputPath)) {
    fs.unlinkSync(webpOutputPath);
  }

  // Encoding
  const image = await Jimp.read(originalPath);
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

  // Decoding
  const webp = fs.readFileSync(webpOutputPath);
  const webpDecoded = await decode(webp);
  const webpInfo = await getInfo(webp);
  const rawImage = await Jimp.create(webpInfo.width, webpInfo.height);

  rawImage.bitmap.data = Buffer.from(webpDecoded);
  fs.writeFileSync(pngOutputPath, await rawImage.getBufferAsync(Jimp.MIME_PNG));

  console.log('Decoding done, see assets/output.png.');
});
