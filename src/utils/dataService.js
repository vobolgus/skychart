/**
 * Data service module that acts as an abstraction layer
 * for accessing Messier data and translations.
 * This will make future migration to API calls easier.
 */

// Add debug flag
const DEBUG = true;

// Debug logger function
function logDebug(message, data) {
  if (DEBUG) {
    console.log(`[DataService] ${message}`, data || '');
  }
}

/**
 * Get Messier object data
 * @returns {Promise<Array>} Array of Messier objects
 */
export async function getMessierData() {
  logDebug('Getting Messier data');
  try {
    // Currently imports locally, but can be changed to fetch from API
    logDebug('Attempting to import messierData from path', '../data/messierData.js');
    const { messierData } = await import('../data/messierData.js');
    logDebug('Successfully loaded messierData, length:', messierData.length);
    return messierData;
  } catch (error) {
    console.error("[DataService] Error loading Messier data:", error);
    // Create a more detailed error report
    console.error("[DataService] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      importPath: '../data/messierData.js'
    });
    return [];
  }
}

/**
 * Get translations data
 * @returns {Promise<Object>} Translations object
 */
export async function getTranslations() {
  logDebug('Getting translations');
  try {
    logDebug('Attempting to import translations from path', '../data/translations.js');
    const { translations } = await import('../data/translations.js');
    logDebug('Successfully loaded translations, languages:', Object.keys(translations));
    return translations;
  } catch (error) {
    console.error("[DataService] Error loading translations:", error);
    // Create a more detailed error report
    console.error("[DataService] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      importPath: '../data/translations.js'
    });
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
  logDebug('Getting available languages');
  const translations = await getTranslations();
  const languages = Object.keys(translations);
  logDebug('Available languages:', languages);
  return languages;
}

/**
 * Get objects for specific difficulty level
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', or 'hard'
 * @returns {Promise<Array<number>>} Array of Messier object numbers for the difficulty
 */
export function getObjectsForDifficulty(difficulty) {
  logDebug('Getting objects for difficulty:', difficulty);
  let objects = [];

  switch (difficulty) {
    case 'easy':
      objects = [1, 13, 31, 42, 45, 51, 57, 81, 82, 104]; // Example objects
      break;
    case 'medium':
      objects = Array.from({ length: 50 }, (_, i) => i + 1); // M1 to M50
      break;
    case 'hard':
      objects = Array.from({ length: 110 }, (_, i) => i + 1); // M1 to M110
      break;
    default:
      objects = Array.from({ length: 50 }, (_, i) => i + 1); // Default to medium
      break;
  }

  logDebug(`Returning ${objects.length} objects for difficulty:`, difficulty);
  return objects;
}