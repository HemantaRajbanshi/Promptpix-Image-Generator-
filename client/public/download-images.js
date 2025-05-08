const fs = require('fs');
const path = require('path');
const https = require('https');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// List of image URLs to download
const imageUrls = [
  'https://source.unsplash.com/random/800x600?ai-art',
  'https://source.unsplash.com/random/800x600?digital-art',
  'https://source.unsplash.com/random/800x600?generative-art',
  'https://source.unsplash.com/random/800x600?abstract-art',
  'https://source.unsplash.com/random/800x600?futuristic',
  'https://source.unsplash.com/random/800x600?cyberpunk',
  'https://source.unsplash.com/random/800x600?fantasy-art',
  'https://source.unsplash.com/random/800x600?sci-fi',
  'https://source.unsplash.com/random/800x600?surreal',
  'https://source.unsplash.com/random/800x600?neon',
  'https://source.unsplash.com/random/800x600?space-art',
  'https://source.unsplash.com/random/800x600?digital-landscape'
];

// Download images
imageUrls.forEach((url, index) => {
  const fileName = `ai-image-${index + 1}.jpg`;
  const filePath = path.join(imagesDir, fileName);
  
  console.log(`Downloading ${fileName}...`);
  
  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${fileName}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${fileName}: ${err.message}`);
    fs.unlink(filePath, () => {}); // Delete the file if there was an error
  });
});

console.log('Started downloading images. This may take a few moments...');
