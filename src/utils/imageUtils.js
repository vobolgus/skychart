/**
 * Utility functions for image handling
 * JavaScript equivalent of the avif.sh shell script
 */

// Add debug flag
const DEBUG = true;

// Debug logger function
function logDebug(message, data) {
  if (DEBUG) {
    console.log(`[ImageUtils] ${message}`, data || '');
  }
}

/**
 * Preload images for the game
 * @param {Array<string>} imagePaths - Array of image paths to preload
 * @param {Function} progressCallback - Callback function for loading progress
 * @param {Function} completionCallback - Callback function when loading completes
 */
export function preloadImages(imagePaths, progressCallback, completionCallback) {
  logDebug('Starting to preload images, count:', imagePaths.length);

  let loadedImages = 0;
  let errorImages = 0;
  const totalImages = imagePaths.length;

  // Log the first few paths to help with debugging
  if (imagePaths.length > 0) {
    logDebug('Sample image paths:', imagePaths.slice(0, 3));
  }

  if (totalImages === 0) {
    logDebug('No images to preload, calling completion callback');
    completionCallback();
    return;
  }

  const updateProgress = () => {
    const percent = Math.floor((loadedImages / totalImages) * 100);
    logDebug(`Loading progress: ${percent}% (${loadedImages}/${totalImages}, errors: ${errorImages})`);
    progressCallback(percent);
  };

  for (let i = 0; i < totalImages; i++) {
    const img = new Image();

    img.onload = () => {
      loadedImages++;
      if (i % 10 === 0 || loadedImages === totalImages) {
        logDebug(`Loaded image: ${imagePaths[i]}`);
      }
      updateProgress();
      if (loadedImages + errorImages === totalImages) {
        logDebug('All images processed, calling completion callback');
        completionCallback();
      }
    };

    img.onerror = () => {
      errorImages++;
      console.error('[ImageUtils] Error loading image:', imagePaths[i]);
      updateProgress();
      if (loadedImages + errorImages === totalImages) {
        logDebug('All images processed (with errors), calling completion callback');
        completionCallback();
      }
    };

    // Set crossOrigin if needed for CORS
    img.crossOrigin = 'anonymous';

    // Set src after adding event handlers
    logDebug(`Starting to load image ${i+1}/${totalImages}: ${imagePaths[i]}`);
    img.src = imagePaths[i];
  }
}

/**
 * Get paths for images to preload based on difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {Array<string>} Array of image paths to preload
 */
export function getImagePathsForDifficulty(difficulty) {
  logDebug('Getting image paths for difficulty:', difficulty);

  let objectList = [];
  switch (difficulty) {
    case 'easy':
      objectList = [1, 13, 31, 42, 45, 51, 57, 81, 82, 104];
      break;
    case 'medium':
      objectList = Array.from({ length: 50 }, (_, i) => i + 1);
      break;
    case 'hard':
      objectList = Array.from({ length: 110 }, (_, i) => i + 1);
      break;
    default:
      objectList = Array.from({ length: 50 }, (_, i) => i + 1);
  }

  logDebug(`Selected ${objectList.length} objects for preloading`);

  // Try multiple path formats to debug path issues
  const paths = [];
  const pathFormats = [
    // Format 1: With leading slash (absolute URL from domain root)
    (i) => `/public/photos_avif/M${i}.avif`,
    (i) => `/public/maps_avif/M${i}_map.avif`,
    (i) => `/public/maps_avif/M${i}_map_full.avif`,

    // Debug format - try alternate paths in case Vercel is serving from a different structure
    // We'll log which ones actually work
    (i) => `./public/photos_avif/M${i}.avif`,
    (i) => `./public/maps_avif/M${i}_map.avif`,
    (i) => `../public/photos_avif/M${i}.avif`,
  ];

  // Use only the first 3 path formats for actual loading
  // (the additional formats are just for debugging)
  for (const i of objectList) {
    for (let j = 0; j < 3; j++) {
      paths.push(pathFormats[j](i));
    }
  }

  logDebug(`Generated ${paths.length} image paths for preloading`);
  return paths;
}