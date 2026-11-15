const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a valid green PNG with a white cross / pill shape
function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: Truecolor (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  const rawBytes = [];
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.45;

  for (let y = 0; y < height; y++) {
    rawBytes.push(0); // filter type none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // White cross inside green circle
      const isCross = (Math.abs(dx) < width * 0.1 && Math.abs(dy) < height * 0.28) ||
                      (Math.abs(dy) < height * 0.1 && Math.abs(dx) < width * 0.28);

      if (dist < r) {
        if (isCross) {
          rawBytes.push(255, 255, 255); // White
        } else {
          rawBytes.push(22, 163, 74); // Emerald #16a34a
        }
      } else {
        rawBytes.push(240, 253, 244); // Light green background #f0fdf4
      }
    }
  }

  const compressedData = zlib.deflateSync(Buffer.from(rawBytes));
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Simple CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(pubDir, 'icon-512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPNG(32, 32));

console.log('Successfully generated PWA icons: icon-192.png, icon-512.png, favicon.ico');
