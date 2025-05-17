/**
 * Data service module that acts as an abstraction layer 
 * for accessing Messier data and translations.
 * This will make future migration to API calls easier.
 */

/**
 * Get Messier object data
 * @returns {Promise<Array>} Array of Messier objects
 */
export async function getMessierData() {
  try {
    // Currently imports locally, but can be changed to fetch from API
    const { messierData } = await import('../data/messierData.js');
    return messierData;
  } catch (error) {
    console.error("Error loading Messier data:", error);
    return [];
  }
}

/**
 * Get translations data
 * @returns {Promise<Object>} Translations object
 */
export async function getTranslations() {
  try {
    const { translations } = await import('../data/translations.js');
    return translations;
  } catch (error) {
    console.error("Error loading translations:", error);
    return {
      en: {},
      ru: {}
    };
  }
}

/**
 * Get available languages
 * @returns {Promise<Array<string>>} Array of language codes
 */
export async function getAvailableLanguages() {
  const translations = await getTranslations();
  return Object.keys(translations);
}

/**
 * Get objects for specific difficulty level
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', or 'hard'
 * @returns {Promise<Array<number>>} Array of Messier object numbers for the difficulty
 */
export function getObjectsForDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy':
      return [1, 13, 31, 42, 45, 51, 57, 81, 82, 104]; // Example objects
    case 'medium':
      return Array.from({ length: 50 }, (_, i) => i + 1); // M1 to M50
    case 'hard':
      return Array.from({ length: 110 }, (_, i) => i + 1); // M1 to M110
    default:
      return Array.from({ length: 50 }, (_, i) => i + 1); // Default to medium
  }
}