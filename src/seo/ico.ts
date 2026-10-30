// Wraps one PNG in an ICO file: a 6 byte header, one 16 byte directory entry,
// then the PNG bytes. All numbers little endian. Build only.

const HEADER = 6;
const ENTRY = 16;

export function pngToIco(png: Uint8Array, size: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(HEADER + ENTRY + png.length);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, 1, true); // image count
  view.setUint8(6, size >= 256 ? 0 : size); // width (0 means 256)
  view.setUint8(7, size >= 256 ? 0 : size); // height
  view.setUint8(8, 0); // palette colors
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, png.length, true); // image byte length
  view.setUint32(18, HEADER + ENTRY, true); // image offset
  out.set(png, HEADER + ENTRY);
  return out;
}
