/**
 * Utility functions for image handling
 * JavaScript equivalent of the avif.sh shell script
 */

/**
 * Preload images for the game
 * @param {Array<string>} imagePaths - Array of image paths to preload
 * @param {Function} progressCallback - Callback function for loading progress
 * @param {Function} completionCallback - Callback function when loading completes
 */
export function preloadImages(imagePaths, progressCallback, completionCallback) {
  let loadedImages = 0;
  const totalImages = imagePaths.length;

  if (totalImages === 0) {
    completionCallback();
    return;
  }

  const updateProgress = () => {
    const percent = Math.floor((loadedImages / totalImages) * 100);
    progressCallback(percent);
  };

  for (let i = 0; i < totalImages; i++) {
    const img = new Image();
    img.src = imagePaths[i];
    img.onload = () => {
      loadedImages++;
      updateProgress();
      if (loadedImages === totalImages) {
        completionCallback();
      }
    };
    img.onerror = () => {
      console.error('Error loading image:', imagePaths[i]);
      loadedImages++;
      updateProgress();
      if (loadedImages === totalImages) {
        completionCallback();
      }
    };
  }
}

/**
 * Get paths for images to preload based on difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {Array<string>} Array of image paths to preload
 */
export function getImagePathsForDifficulty(difficulty) {
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

  const paths = [];
  for (const i of objectList) {
    paths.push(`/public/photos_avif/M${i}.avif`);
    paths.push(`/public/maps_avif/M${i}_map.avif`);
    paths.push(`/public/maps_avif/M${i}_map_full.avif`);
  }
  return paths;
}