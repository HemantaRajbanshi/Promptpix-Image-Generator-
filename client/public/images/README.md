# Image Gallery for PromptPix

This directory contains images used in the PromptPix application, particularly for the landing page image collage.

## Adding Images

To download placeholder images for development, run the following command from the project root:

```bash
cd client/public
node download-images.js
```

This will download 12 random AI-themed images from Unsplash and save them to this directory.

## Production Images

For production, replace these placeholder images with your own high-quality AI-generated images that showcase the capabilities of PromptPix.

## Image Naming Convention

Images should follow the naming convention:
- `ai-image-1.jpg`
- `ai-image-2.jpg`
- etc.

This ensures they are properly loaded by the application.
