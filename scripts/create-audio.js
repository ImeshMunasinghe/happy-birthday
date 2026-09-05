const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'public', 'audio');
const tracks = ['happy-birthday', 'celebration', 'chill', 'romantic'];

// Minimal valid MP3 frame header (MPEG-1 Layer 3, 128kbps, 44100Hz)
const mp3Header = Buffer.from([0xFF, 0xFB, 0x90, 0x00]);

tracks.forEach(track => {
  const filePath = path.join(audioDir, `${track}.mp3`);
  // Create a small valid MP3 file (~0.5s of silence)
  const frameData = Buffer.alloc(417, 0);
  const data = Buffer.concat(Array(20).fill(Buffer.concat([mp3Header, frameData])));
  fs.writeFileSync(filePath, data);
  console.log(`Created ${filePath} (${data.length} bytes)`);
});

console.log('Done! Placeholder audio files created.');
