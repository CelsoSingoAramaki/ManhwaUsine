import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal standalone zip creator in pure Node.js (no external npm dependencies required)
class ZipPacker {
  constructor() {
    this.files = [];
  }

  // Calculate standard CRC32
  crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ ZipPacker.table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  addFile(nameInZip, contentBuffer, modDate = new Date()) {
    const filenameUtf8 = Buffer.from(nameInZip.replace(/\\/g, '/'), 'utf8');
    const crc = this.crc32(contentBuffer);
    const uncompressedSize = contentBuffer.length;
    
    // Deflate
    const compressed = zlib.deflateRawSync(contentBuffer, { level: 9 });
    const compressedSize = compressed.length;

    const time = ((modDate.getHours() << 11) | (modDate.getMinutes() << 5) | (modDate.getSeconds() >> 1)) & 0xffff;
    const date = (((modDate.getFullYear() - 1980) << 9) | ((modDate.getMonth() + 1) << 5) | modDate.getDate()) & 0xffff;

    this.files.push({
      filenameUtf8,
      nameInZip,
      compressed,
      uncompressedSize,
      compressedSize,
      crc,
      time,
      date,
    });
  }

  addDirectory(dirPath, rootDirInZip = '') {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeName = rootDirInZip ? `${rootDirInZip}/${item}` : item;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        this.addDirectory(fullPath, relativeName);
      } else if (stat.isFile()) {
        const fileData = fs.readFileSync(fullPath);
        this.addFile(relativeName, fileData, stat.mtime);
      }
    }
  }

  buildZipBuffer() {
    const localParts = [];
    const cdEntries = [];
    let offset = 0;

    for (const f of this.files) {
      // Local file header (30 bytes + name length)
      const localHeader = Buffer.alloc(30);
      localHeader.writeUInt32LE(0x04034b50, 0); // signature
      localHeader.writeUInt16LE(20, 4); // version needed (2.0)
      localHeader.writeUInt16LE(0x0800, 6); // flags (bit 11 = UTF-8)
      localHeader.writeUInt16LE(8, 8); // compression method (8 = Deflate)
      localHeader.writeUInt16LE(f.time, 10);
      localHeader.writeUInt16LE(f.date, 12);
      localHeader.writeUInt32LE(f.crc, 14);
      localHeader.writeUInt32LE(f.compressedSize, 18);
      localHeader.writeUInt32LE(f.uncompressedSize, 22);
      localHeader.writeUInt16LE(f.filenameUtf8.length, 26);
      localHeader.writeUInt16LE(0, 28); // extra field length

      localParts.push(localHeader, f.filenameUtf8, f.compressed);

      // Central Directory file header (46 bytes + name length)
      const cdHeader = Buffer.alloc(46);
      cdHeader.writeUInt32LE(0x02014b50, 0); // signature
      cdHeader.writeUInt16LE(20, 4); // version made by
      cdHeader.writeUInt16LE(20, 6); // version needed
      cdHeader.writeUInt16LE(0x0800, 8); // flags
      cdHeader.writeUInt16LE(8, 10); // method (Deflate)
      cdHeader.writeUInt16LE(f.time, 12);
      cdHeader.writeUInt16LE(f.date, 14);
      cdHeader.writeUInt32LE(f.crc, 16);
      cdHeader.writeUInt32LE(f.compressedSize, 20);
      cdHeader.writeUInt32LE(f.uncompressedSize, 24);
      cdHeader.writeUInt16LE(f.filenameUtf8.length, 28);
      cdHeader.writeUInt16LE(0, 30); // extra length
      cdHeader.writeUInt16LE(0, 32); // file comment length
      cdHeader.writeUInt16LE(0, 34); // disk number start
      cdHeader.writeUInt16LE(0, 36); // internal file attributes
      cdHeader.writeUInt32LE(0x81a40000, 38); // external file attributes (regular file 0644)
      cdHeader.writeUInt32LE(offset, 42); // relative offset of local header

      cdEntries.push(cdHeader, f.filenameUtf8);

      offset += localHeader.length + f.filenameUtf8.length + f.compressed.length;
    }

    const cdBuffer = Buffer.concat(cdEntries);
    const cdOffset = offset;
    const cdSize = cdBuffer.length;

    // End of central directory record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // signature
    eocd.writeUInt16LE(0, 4); // disk number
    eocd.writeUInt16LE(0, 6); // disk where central directory starts
    eocd.writeUInt16LE(this.files.length, 8); // number of entries on this disk
    eocd.writeUInt16LE(this.files.length, 10); // total entries
    eocd.writeUInt32LE(cdSize, 12); // size of central directory
    eocd.writeUInt32LE(cdOffset, 16); // offset of central directory
    eocd.writeUInt16LE(0, 20); // comment length

    return Buffer.concat([...localParts, cdBuffer, eocd]);
  }
}

// CRC32 Lookup Table
ZipPacker.table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

// Build zip 1: GoDaddy cPanel Ready Production Build (dist contents + .htaccess)
console.log('Packaging godaddy-cpanel-dist.zip ...');
const distZip = new ZipPacker();
distZip.addDirectory(path.resolve('dist'), '');
const distZipBuffer = distZip.buildZipBuffer();

// Place in public so user can download directly via browser if desired
if (!fs.existsSync('public/downloads')) {
  fs.mkdirSync('public/downloads', { recursive: true });
}
fs.writeFileSync('public/downloads/godaddy-cpanel-dist.zip', distZipBuffer);
fs.writeFileSync('godaddy-cpanel-dist.zip', distZipBuffer);
console.log(`Created godaddy-cpanel-dist.zip (${(distZipBuffer.length / 1024).toFixed(1)} KB)`);

// Build zip 2: Complete Project Source Code
console.log('Packaging manhwa-source-code.zip ...');
const srcZip = new ZipPacker();
const ignoreList = new Set(['node_modules', '.git', 'dist', 'package-lock.json', '.cache']);

function addSourceFiles(dir, relPath = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (ignoreList.has(item)) continue;
    if (item.endsWith('.zip')) continue;
    const full = path.join(dir, item);
    const subRel = relPath ? `${relPath}/${item}` : item;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      addSourceFiles(full, subRel);
    } else if (stat.isFile()) {
      srcZip.addFile(subRel, fs.readFileSync(full), stat.mtime);
    }
  }
}

addSourceFiles(path.resolve('.'), '');
const srcZipBuffer = srcZip.buildZipBuffer();
fs.writeFileSync('public/downloads/manhwa-source-code.zip', srcZipBuffer);
fs.writeFileSync('manhwa-source-code.zip', srcZipBuffer);
console.log(`Created manhwa-source-code.zip (${(srcZipBuffer.length / 1024).toFixed(1)} KB)`);
